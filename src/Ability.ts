import { extractFromSet } from "src/Util";

export enum Ability {
    None = 'X',

    // rerolls
    Balanced = "Balanced", // reroll 1 die; also used for Extended Chitin during defense
    DoubleBalanced = "DoubleBalanced", // reroll 2 dice; basicially single reroll ability from two different sources
    RerollOnes = "Ones", // reroll all 1s, was called ceaseless in 2021
    Relentless = "Relentless", // reroll any of your choosing; we choose to reroll all fails; we never fish for crits
    CritFishRelentless = "CritFishRelentless", // reroll all non-crits, aka crit fishing
    RerollOnesPlusBalanced = "BothOnesAndBalanced", // ex: in 2021, Auto Bolt Rifle and Devastator Doctrine
    RerollMostCommonFail = "MostCommonFail", // "can re-roll any or all of your attack dice results of one result (e.g. results of 2)"

    // fail/norm/crit manipulation
    Severe = "Severe", // if no crits, promote one normal hit to crit
    Rending = "Rending", // if have crit, promote one normal hit to crit
    FailToNormIfCrit = "Punishing/FailToNormIfCrit", // crit triggers promotion of fail to norm; 2024 Punishing; 2021: Starfire, DakkaDakkaDakka, Toxin Sacs
    FailToNormIfAtLeastTwoSuccesses = "CloseAssault", // if at least two successes, promote fail to norm; from Imperial Navy Breachers Close Assault
    EliteModerate = "EliteModerate", // promote miss to norm or norm to crit
    EliteExtreme = "EliteExtreme", // promote miss to crit
    JustAScratch = "JustAScratch", // cancel one attack die just before damage; both shoot and fight
    Durable = "Durable2021", // one crit hit does 1 less damage, to minimun of 3

    // fight stuff relevant to 2024
    Brutal = "Brutal", // opponent can only parry with crit
    Shock = "Shock", // "the first time you strike with a crit, also discard one of opponent's unresolved norms (or crit if no norms)"

    // fight stuff relevant to only 2021 or I have not checked for 2024
    Stun2021 = "Stun2021", // effect different between shoot and fight
    StormShield2021 = "StormShield2021", // each parry cancels two successes
    Hammerhand2021 = "Hammerhand2021", // first strike does one extra dmg
    Dueller = "Dueller2021", // each crit parry cancels extra normal success
    Duelist = "Duelist2021", // parry before usual dice resolution
    NormToCritIfAtLeastTwoNorms = "Waaagh2021", // if at least two norms, promote norm to crit; from Kommandos Waaagh; fight only
    MurderousEntrance2021 = "MurderousEntrance2021", // after a crit strike, do another strike (tactical ploy, so just once)

};

export const rerollAbilities = [
  Ability.Balanced,
  Ability.DoubleBalanced,
  Ability.RerollMostCommonFail,
  Ability.Relentless,
  Ability.CritFishRelentless,
  Ability.RerollOnes,
  Ability.RerollOnesPlusBalanced,
];

export const mutuallyExclusiveFightAbilities = [
  Ability.None,
  Ability.FailToNormIfAtLeastTwoSuccesses,
  Ability.Dueller,
  Ability.Hammerhand2021,
  Ability.StormShield2021,
  Ability.NormToCritIfAtLeastTwoNorms,
  Ability.MurderousEntrance2021,
];

export const eliteAbilities = [
  Ability.None,
  Ability.EliteModerate,
  Ability.EliteExtreme,
];

export const rendingAndSevereAbilities = [
  Ability.None,
  Ability.Rending,
  Ability.Severe,
];

export function extractAbility(desiredAbility: Ability, abilities: Set<Ability>): Ability | null {
  return extractFromSet([desiredAbility], Ability.None, abilities);
}

export default Ability;