export enum Ability {
    None = 'X',
    Balanced = "Balanced", // reroll 1 die; also used for Extended Chitin during defense
    Ceaseless = "Ceaseless", // reroll all 1s
    Relentless = "Relentless", // reroll any of your choosing
    CeaselessPlusBalanced = "BothCeaselessAndBalanced", // ex: Auto Bolt Rifle (Ceaseless) and Devastator Doctrine (Balanced)
    Rending = "Rending", // if have crit, promote one normal hit to crit
    CritPromotesOneFailToNormal = "Starfire", // Necron 'starfire core' equipment
    StormShield = "StormShield", // each parry cancels two successes
    Hammerhand = "Hammerhand", // first strike does one extra dmg
    Dueller = "Dueller", // each crit parry cancels extra normal success
    Stun = "Stun", // effect different between shoot and fight
}

export const rerollAbilities = [
  Ability.Ceaseless,
  Ability.Balanced,
  Ability.Relentless,
  Ability.CeaselessPlusBalanced,
];

export const mutuallyExclusiveFightAbilities = [
  Ability.None,
  Ability.Dueller,
  Ability.Hammerhand,
  Ability.StormShield,
];

export default Ability;