export enum Ability {
    None = 'X',
    Balanced = "Balanced", // reroll 1 die; also used for Extended Chitin during defense
    Ceaseless = "Ceaseless", // reroll all 1s
    Relentless = "Relentless", // reroll any of your choosing
    Rending = "Rending", // if have crit, promote one normal hit to crit
    CritPromotesOneFailToNormal = "Starfire", // Necron 'starfire core' equipment
}

export const rerollAbilities = [Ability.Balanced, Ability.Ceaseless, Ability.Relentless];

export default Ability;