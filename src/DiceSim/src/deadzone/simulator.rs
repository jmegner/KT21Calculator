use std::collections::HashMap;

use rand::prelude::*;
use wasm_bindgen::prelude::*;

use super::deadzone_model::DeadzoneModel;
use super::deadzone_options::DeadzoneOptions;
use crate::common::ts_types::ToJsMap;
use crate::common::{add_to_map_value, binomial_pmf, calc_multi_round_damage};

#[derive(Default)]
struct Sf {
    s: i32,
    f: i32,
}

impl Sf {
    fn new() -> Self {
        Default::default()
    }

    fn add(&mut self, other: &Sf) {
        self.s += other.s;
        self.f += other.f;
    }

    fn total(&self) -> i32 {
        self.s + self.f
    }
}

const PIP_LO: i32 = 1;
const PIP_HI: i32 = 8;
const SHIELD_SUCCESS_PROB: f64 = 0.375;

#[wasm_bindgen(js_name = "deadzoneCalcDmgProbs")]
pub fn deadzone_calc_dmg_probs(
    attacker: &DeadzoneModel,
    defender: &DeadzoneModel,
    options: &DeadzoneOptions,
) -> js_sys::Map {
    let mut rng = rand::thread_rng();
    let die_distribution = rand::distributions::Uniform::new(PIP_LO, PIP_HI + 1);
    let atk_success_probs = make_success_probs(&die_distribution, &mut rng, &attacker, &options);
    let def_success_probs = make_success_probs(&die_distribution, &mut rng, &defender, &options);

    damage_probs_from_successes(
        attacker,
        defender,
        options,
        &atk_success_probs,
        &def_success_probs,
    )
    .to_js_map()
}

fn damage_probs_from_successes(
    attacker: &DeadzoneModel,
    defender: &DeadzoneModel,
    options: &DeadzoneOptions,
    atk_success_probs: &HashMap<i32, f64>,
    def_success_probs: &HashMap<i32, f64>,
) -> HashMap<i32, f64> {
    if options.is_halo_flashpoint {
        // Halo Flashpoint only: no fight back, and shield depletion must persist
        // across attacks rather than convolving independent damage distributions.
        let mut hit_probs = HashMap::new();
        for (atk_successes, atk_prob) in atk_success_probs {
            for (def_successes, def_prob) in def_success_probs {
                add_to_map_value(
                    &mut hit_probs,
                    &(atk_successes - def_successes).max(0),
                    atk_prob * def_prob,
                );
            }
        }
        // State: (total wounds, remaining charged shields). These are consecutive
        // attacks, not game rounds: no regeneration or respawning is implied.
        let mut states = HashMap::from([((0, defender.energy_shields), 1.0)]);
        for _ in 0..options.num_rounds {
            let mut next_states = HashMap::new();
            for ((wounds, shields), state_prob) in states {
                for (&hits, &hit_prob) in &hit_probs {
                    let (damage, remaining_shields) =
                        resolve_halo_hits(hits, shields, attacker, defender);
                    add_to_map_value(
                        &mut next_states,
                        &(wounds + damage, remaining_shields),
                        state_prob * hit_prob,
                    );
                }
            }
            states = next_states;
        }
        let mut dmg_probs = HashMap::new();
        for ((wounds, _), prob) in states {
            add_to_map_value(&mut dmg_probs, &wounds, prob);
        }
        return dmg_probs;
    }
    let mut dmg_probs = HashMap::<i32, f64>::new();

    for (atk_successes, atk_prob) in atk_success_probs.iter() {
        for (def_successes, def_prob) in def_success_probs.iter() {
            let mut orig_dmg = atk_successes - def_successes;

            if !options.attacker_can_be_damaged {
                orig_dmg = std::cmp::max(0, orig_dmg);
            }

            let (dmg_giver, dmg_receiver) = if orig_dmg >= 0 {
                (&attacker, &defender)
            } else {
                (&defender, &attacker)
            };
            let net_armor = std::cmp::max(0, dmg_receiver.armor - dmg_giver.ap);
            let num_shield_dice = if orig_dmg == 0 {
                0
            } else {
                dmg_receiver.num_shield_dice
            };
            let atk_and_def_prob = atk_prob * def_prob;

            for shield_successes in 0..=num_shield_dice {
                let shield_prob = if num_shield_dice == 0 {
                    1.0
                } else {
                    binomial_pmf(num_shield_dice, shield_successes, SHIELD_SUCCESS_PROB)
                };
                let post_shield_dmg = std::cmp::max(0, orig_dmg.abs() - shield_successes);
                let post_armor_dmg = std::cmp::max(0, post_shield_dmg - net_armor);
                let post_toxic_dmg = damage_with_bonus(post_armor_dmg, dmg_giver.toxic_dmg);
                add_to_map_value(
                    &mut dmg_probs,
                    &(orig_dmg.signum() * post_toxic_dmg),
                    atk_and_def_prob * shield_prob,
                );
            }
        }
    }
    if options.num_rounds > 1 {
        dmg_probs = calc_multi_round_damage(&dmg_probs, options.num_rounds);
    }
    return dmg_probs;
}

// Both Deadzone Toxic/Dismantle and Halo Flashpoint Lethal require a wound first.
fn damage_with_bonus(damage: i32, bonus: i32) -> i32 {
    if damage > 0 {
        damage + bonus
    } else {
        0
    }
}

// Halo Flashpoint only: ESD triggers on hits (even if armour later blocks them),
// then charged shields absorb one hit each before AP/armour and Lethal resolve.
fn resolve_halo_hits(
    hits: i32,
    shields: i32,
    attacker: &DeadzoneModel,
    defender: &DeadzoneModel,
) -> (i32, i32) {
    if hits == 0 {
        return (0, shields);
    }
    let shields_after_esd = (shields - attacker.shield_depleter).max(0);
    let unblocked_hits = (hits - shields_after_esd).max(0);
    let remaining_shields = (shields_after_esd - hits).max(0);
    let net_armor = (defender.armor - attacker.ap).max(0);
    let damage = damage_with_bonus((unblocked_hits - net_armor).max(0), attacker.toxic_dmg);
    (damage, remaining_shields)
}

fn make_success_probs(
    die_distribution: &rand::distributions::Uniform<i32>,
    rng: &mut ThreadRng,
    model: &DeadzoneModel,
    options: &DeadzoneOptions,
) -> HashMap<i32, f64> {
    let mut success_counts = HashMap::<i32, i32>::new();
    for _ in 0..options.num_simulations {
        let num_successes = simulated_num_successes_from_multi_roll(
            die_distribution,
            rng,
            model.num_dice,
            model.dice_stat,
            model.explode_stat,
            model.num_rerolls,
            options.exploding_dice_max_levels,
        );
        add_to_map_value(&mut success_counts, &num_successes, 1);
    }
    let success_probs = success_counts
        .iter()
        .map(|(k, v)| (*k, *v as f64 / options.num_simulations as f64))
        .collect();
    return success_probs;
}

fn simulated_num_successes_from_multi_roll(
    die_distribution: &rand::distributions::Uniform<i32>,
    rng: &mut ThreadRng,
    num_dice: i32,
    dice_stat: i32,
    explode_stat: i32,
    num_rerolls: i32,
    exploding_dice_max_levels: i32,
) -> i32 {
    let mut sf = Sf::new();

    for _ in 0..num_dice {
        sf.add(&simulated_sf_from_single_roll(
            die_distribution,
            rng,
            dice_stat,
            explode_stat,
            exploding_dice_max_levels,
        ));
    }

    let num_original_successes = sf.s;
    let num_rerolled_successes = if num_rerolls == 0 || sf.f == 0 {
        0
    } else {
        let num_actual_rerolls = std::cmp::min(num_rerolls, sf.f);
        simulated_num_successes_from_multi_roll(
            die_distribution,
            rng,
            num_actual_rerolls,
            dice_stat,
            explode_stat,
            0,
            exploding_dice_max_levels,
        )
    };
    return num_original_successes + num_rerolled_successes;
}

fn simulated_sf_from_single_roll(
    die_distribution: &rand::distributions::Uniform<i32>,
    rng: &mut ThreadRng,
    dice_stat: i32,
    explode_stat: i32,
    exploding_dice_max_levels: i32,
) -> Sf {
    let mut sf = Sf::new();
    loop {
        let pip_outcome = die_distribution.sample(rng);
        if pip_outcome >= dice_stat {
            sf.s += 1;
        } else {
            sf.f += 1;
        }
        if pip_outcome < explode_stat || sf.total() > exploding_dice_max_levels {
            break;
        }
    }
    return sf;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn halo_shields_esd_armor_and_lethal_resolve_in_order() {
        let mut attacker = DeadzoneModel::new();
        let mut defender = DeadzoneModel::new();
        attacker.shield_depleter = 1;
        attacker.toxic_dmg = 2;
        defender.armor = 1;
        assert_eq!(resolve_halo_hits(0, 3, &attacker, &defender), (0, 3));
        assert_eq!(resolve_halo_hits(1, 3, &attacker, &defender), (0, 1));
        assert_eq!(resolve_halo_hits(3, 3, &attacker, &defender), (0, 0));
        assert_eq!(resolve_halo_hits(4, 3, &attacker, &defender), (3, 0));
        attacker.ap = 1;
        assert_eq!(resolve_halo_hits(3, 3, &attacker, &defender), (3, 0));
        attacker.shield_depleter = 9;
        attacker.ap = 9;
        assert_eq!(resolve_halo_hits(1, 3, &attacker, &defender), (3, 0));
    }

    #[test]
    fn halo_repeated_attacks_preserve_shields_and_probability() {
        let attacker = DeadzoneModel::new();
        let mut defender = DeadzoneModel::new();
        let mut options = DeadzoneOptions::new();
        defender.energy_shields = 1;
        options.is_halo_flashpoint = true;
        options.num_rounds = 2;
        let probs = damage_probs_from_successes(
            &attacker,
            &defender,
            &options,
            &HashMap::from([(0, 0.5), (2, 0.5)]),
            &HashMap::from([(1, 1.0)]),
        );
        // Two successful one-hit attacks deplete one shield and cause one wound.
        assert_eq!(probs, HashMap::from([(0, 0.75), (1, 0.25)]));
    }

    #[test]
    fn halo_never_fights_back_even_if_deadzone_option_is_set() {
        let mut options = DeadzoneOptions::new();
        options.is_halo_flashpoint = true;
        options.attacker_can_be_damaged = true;
        assert_eq!(
            damage_probs_from_successes(
                &DeadzoneModel::new(),
                &DeadzoneModel::new(),
                &options,
                &HashMap::from([(0, 1.0)]),
                &HashMap::from([(3, 1.0)]),
            ),
            HashMap::from([(0, 1.0)])
        );
    }

    #[test]
    fn deadzone_toxic_requires_damage_after_shields_and_armor() {
        let mut attacker = DeadzoneModel::new();
        let mut defender = DeadzoneModel::new();
        let options = DeadzoneOptions::new();
        attacker.toxic_dmg = 2;
        defender.armor = 1;
        let attack = HashMap::from([(1, 1.0)]);
        let defense = HashMap::from([(0, 1.0)]);
        assert_eq!(
            damage_probs_from_successes(&attacker, &defender, &options, &attack, &defense),
            HashMap::from([(0, 1.0)])
        );
        defender.armor = 0;
        defender.num_shield_dice = 1;
        assert_eq!(
            damage_probs_from_successes(&attacker, &defender, &options, &attack, &defense),
            HashMap::from([(0, 0.375), (3, 0.625)])
        );
    }

    #[test]
    fn deadzone_fight_back_and_rounds_still_work() {
        let mut attacker = DeadzoneModel::new();
        let mut defender = DeadzoneModel::new();
        let mut options = DeadzoneOptions::new();
        attacker.armor = 1;
        defender.ap = 1;
        defender.toxic_dmg = 1;
        options.attacker_can_be_damaged = true;
        options.num_rounds = 2;
        assert_eq!(
            damage_probs_from_successes(
                &attacker,
                &defender,
                &options,
                &HashMap::from([(0, 1.0)]),
                &HashMap::from([(1, 1.0)]),
            ),
            HashMap::from([(-4, 1.0)])
        );
    }

    #[test]
    fn headshots_support_eights_sevens_and_disabled() {
        let mut rng = rand::thread_rng();
        for (pip, threshold, expected) in [(8, 8, 3), (7, 8, 1), (7, 7, 3), (8, 9, 1)] {
            let distribution = rand::distributions::Uniform::new(pip, pip + 1);
            assert_eq!(
                simulated_num_successes_from_multi_roll(
                    &distribution,
                    &mut rng,
                    1,
                    5,
                    threshold,
                    0,
                    2,
                ),
                expected
            );
        }
    }
}
