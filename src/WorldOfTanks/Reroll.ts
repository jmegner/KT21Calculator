import Ability from "src/Ability";

export enum Reroll {
  None = "None",
  One = "One",
  All = "All",
}

export const rerolls = [Reroll.None, Reroll.One, Reroll.All];

export function toAbility(reroll: Reroll): Ability {
  if(reroll === Reroll.One) { return Ability.Balanced; }
  if(reroll === Reroll.All) { return Ability.Relentless; }
  return Ability.None;
}

export default Reroll;