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
                let post_toxic_dmg = post_armor_dmg + dmg_giver.toxic_dmg;
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
    return dmg_probs.to_js_map();
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
