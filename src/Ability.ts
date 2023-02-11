import { extractFromSet } from "src/Util";

export enum Ability {
    None = 'X',

    // rerolls
    Balanced = "Balanced", // reroll 1 die; also used for Extended Chitin during defense
    DoubleBalanced = "DoubleBalanced", // reroll 2 dice; basicially single reroll ability from two different sources
    Ceaseless = "Ceaseless", // reroll all 1s
    Relentless = "Relentless", // reroll any of your choosing
    CeaselessPlusBalanced = "BothCeaselessAndBalanced", // ex: Auto Bolt Rifle (Ceaseless) and Devastator Doctrine (Balanced)

    // fail/norm/crit manipulation
    Rending = "Rending", // if have crit, promote one normal hit to crit
    CloseAssault = "CloseAssault", // >=2 norms triggers promotion of fail to norm; Imperial Navy Breachers
    FailToNormIfCrit = "FailToNormIfCrit", // crit triggers promotion of fail to norm; Starfire, DakkaDakkaDakka, Toxin Sacs

    // fight stuff
    Brutal = "Brutal", // opponent can only parry with crit
    StormShield = "StormShield", // each parry cancels two successes
    Hammerhand = "Hammerhand", // first strike does one extra dmg
    Dueller = "Dueller", // each crit parry cancels extra normal success
    Stun = "Stun", // effect different between shoot and fight
}

export const rerollAbilities = [
  Ability.Ceaseless,
  Ability.Balanced,
  Ability.DoubleBalanced,
  Ability.Relentless,
  Ability.CeaselessPlusBalanced,
];

export const mutuallyExclusiveFightAbilities = [
  Ability.None,
  Ability.Dueller,
  Ability.Hammerhand,
  Ability.StormShield,
];

export function extractAbility(desiredAbility: Ability, abilities: Set<Ability>): Ability | null {
  return extractFromSet([desiredAbility], Ability.None, abilities);
}

export default Ability;