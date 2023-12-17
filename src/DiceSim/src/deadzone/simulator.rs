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
}

const PIP_LO: i32 = 1;
const PIP_HI: i32 = 8;
const SHIELD_SUCCESS_PROB: f64 = 0.375;

#[wasm_bindgen]
pub fn deadzone_calc_dmg_probs(
    attacker: DeadzoneModel,
    defender: DeadzoneModel,
    options: DeadzoneOptions,
) -> js_sys::Map {
    let mut rng = rand::thread_rng();
    let die_distribution = rand::distributions::Uniform::new(PIP_LO, PIP_HI + 1);
    let atk_success_probs = make_success_probs(
        &die_distribution,
        &mut rng,
        &attacker,
        options.num_simulations,
    );
    let def_success_probs = make_success_probs(
        &die_distribution,
        &mut rng,
        &defender,
        options.num_simulations,
    );
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
    num_simulations: i32,
) -> HashMap<i32, f64> {
    let mut success_counts = HashMap::<i32, i32>::new();
    for _ in 0..num_simulations {
        let num_successes = simulated_num_successes_from_multi_roll(
            die_distribution,
            rng,
            model.num_dice,
            model.dice_stat,
            model.num_rerolls,
        );
        add_to_map_value(&mut success_counts, &num_successes, 1);
    }
    let success_probs = success_counts
        .iter()
        .map(|(k, v)| (*k, *v as f64 / num_simulations as f64))
        .collect();
    return success_probs;
}

fn simulated_num_successes_from_multi_roll(
    die_distribution: &rand::distributions::Uniform<i32>,
    rng: &mut ThreadRng,
    num_dice: i32,
    dice_stat: i32,
    num_rerolls: i32,
) -> i32 {
    let mut sf = Sf::new();

    for _ in 0..num_dice {
        sf.add(&simulated_sf_from_single_roll(
            die_distribution,
            rng,
            dice_stat,
        ));
    }

    let num_original_successes = sf.s;
    let num_rerolled_successes = if num_rerolls == 0 {
        0
    } else {
        simulated_num_successes_from_multi_roll(
            die_distribution,
            rng,
            std::cmp::min(num_rerolls, sf.f),
            dice_stat,
            0,
        )
    };
    return num_original_successes + num_rerolled_successes;
}

fn simulated_sf_from_single_roll(
    die_distribution: &rand::distributions::Uniform<i32>,
    rng: &mut ThreadRng,
    dice_stat: i32,
) -> Sf {
    let mut sf = Sf::new();
    loop {
        let pip_outcome = die_distribution.sample(rng);
        if pip_outcome >= dice_stat {
            sf.s += 1;
        } else {
            sf.f += 1;
        }
        if pip_outcome != PIP_HI {
            break;
        }
    }
    return sf;
}

/*
import Model from "./Model";
import { randomInt } from "mathjs";
import {
  addToMapValue,
  binomialPmf,
  normalizeMapValues,
} from 'src/Util';
import { CombatOptions } from "./CombatOptions";
import { calcMultiRoundDamage } from "src/CalcEngineCommon";

const singleShieldProb = 0.375;

class Sf {
  public s: number; // successes
  public f: number; // failures

  public constructor(s: number = 0, f: number = 0) {
    this.s = s;
    this.f = f;
  }

  public add(other: Sf): void {
    this.s += other.s;
    this.f += other.f;
  }
}

export function calcDmgProbs(
  attacker: Model,
  defender: Model,
  options: CombatOptions = new CombatOptions(),
): Map<number, number> // damage to prob
{
  const atkSuccessProbs = makeSuccessProbs(attacker, options.num_simulations);
  const defSuccessProbs = makeSuccessProbs(defender, options.num_simulations);
  let dmgProbs = new Map<number, number>();

  for (const [atkSuccesses, atkProb] of atkSuccessProbs) {
    for (const [defSuccesses, defProb] of defSuccessProbs) {
      let origDmg = atkSuccesses - defSuccesses;

      if(!options.attacker_can_be_damaged) {
        origDmg = Math.max(0, origDmg);
      }
      const [dmgGiver, dmgReceiver] = origDmg >= 0 ? [attacker, defender] : [defender, attacker];
      const netArmor = Math.max(dmgReceiver.armor - dmgGiver.ap);
      const numShieldDice = origDmg === 0 ? 0 : dmgReceiver.numShieldDice;
      const atkAndDefProb = atkProb * defProb;

      for (let shieldSuccesses = 0;
        shieldSuccesses <= numShieldDice;
        shieldSuccesses++
      ) {
        const shieldProb = numShieldDice === 0 ? 1 : binomialPmf(numShieldDice, shieldSuccesses, singleShieldProb);
        const postShieldDmg = Math.max(0, Math.abs(origDmg) - shieldSuccesses);
        const postArmorDmg = Math.max(0, postShieldDmg - netArmor);
        const postToxicDmg = postArmorDmg + dmgGiver.toxicDmg;
        addToMapValue(dmgProbs, Math.sign(origDmg) * postToxicDmg, atkAndDefProb * shieldProb);
      }
    }
  }
  if(options.num_rounds > 1) {
    dmgProbs = calcMultiRoundDamage(dmgProbs, options.num_rounds);
  }
  return dmgProbs;
}

function makeSuccessProbs(
  model: Model,
  num_simulations: number,
): Map<number, number> {
  const successCounts = new Map<number, number>();
  for(let i = 0; i < num_simulations; i++) {
    const numSuccesses = simulatedNumSuccessesFromMultiRoll(
      model.num_dice,
      model.diceStat,
      model.numRerolls,
    );
    addToMapValue(successCounts, numSuccesses, 1);
  }
  normalizeMapValues(successCounts, num_simulations);
  return successCounts;
}

function simulatedNumSuccessesFromMultiRoll(
  num_dice: number,
  diceStat: number,
  numRerolls: number = 0,
): number {
  const sf = new Sf();

  for(let dieIdx = 0; dieIdx < num_dice; dieIdx++) {
    sf.add(simulatedSfFromSingleRoll(diceStat));
  }

  const numOriginalSuccesses = sf.s;
  const numRerolledSuccesses
    = numRerolls === 0
    ? 0
    : simulatedNumSuccessesFromMultiRoll(Math.min(numRerolls, sf.f), diceStat);
  return numOriginalSuccesses + numRerolledSuccesses;
}

function simulatedSfFromSingleRoll(diceStat: number): Sf {
  const pipLo = 1;
  const pip_hi = 8;
  const sf = new Sf();
  let pipOutcome: number;
  do {
    pipOutcome = randomInt(pipLo, pip_hi + 1);
    if(pipOutcome >= diceStat) {
      sf.s++;
    }
    else {
      sf.f++;
    }
  } while(pipOutcome === pip_hi);
  return sf;
}
*/
