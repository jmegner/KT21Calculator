export default class Note {
  public name: string;
  public description?: string;

  public constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }
}

export const Reroll = new Note(
  `Reroll`,
  `Ceaseless rerolls 1s.  Balanced rerolls 1 die.  Relentless rerolls whatever you want.`,
);
export const Rending = new Note(
  `Rending`,
  `If you roll >=1 crit, you can modify a norm to a crit.`,
);
export const Starfire = new Note(
  `Starfire/DakkaDakkaDakka`,
  `Necron equipment Starfire Core and Kommando strategic ploy "Dakka! Dakka! Dakka!" allow you to modify a failed hit into a normal hit if you had at least one critical hit.`,
);
export const CoverNormSaves = new Note(
  `CoverNormSaves`,
  `How many saves can be automatically retained as a normal success. High enough APx/Px can limit these auto-saves.`,
);
export const CoverCritSaves = new Note(
  `CoverCritSaves`,
  `How many saves can be automatically retained as a critical success. High enough APx/Px can limit these auto-saves.`,
);
export const NormToCrit = new Note(
  `NormToCrit`,
  `How many normal successes can be modified to critical successes.`,
);
export const InvulnSave = new Note(
  `InvulnSave`,
  `Save value that ignores APx/Px.  If you choose a valid value, InvulnSave will be used even if using Save would be better.`,
);
export const HardyX = new Note(
  `HardyX`,
  `HardyX is like LethalX (changes what values give you a critical success), but for defense. Name comes from Intercession Squad chapter tactic Hardy.`,
);
export const FeelNoPain = new Note(
  `FeelNoPain`,
  `FNP is the category of abilities where just before damage is actually resolved, you roll a die for each potential wound, and each rolled success prevents a wound from being lost. Even MWx damage can be prevented via FNP.`,
);
export const AvgDamageUnbounded = new Note(
  `AvgDamageUnbounded`,
  `The average of damage without regard to defender's wounds.`,
);
export const FireTeamRules = new Note(
  `FireTeamRules`,
  `FireTeamRules refers to whether to use the hit-cancellation rules from Warhammer 40,000 Fire Team`
    + ` (very similar to Kill Team, but simpler) where any successful save can cancel any successful hit,`
    + ` but all normal hits must be cancelled before cancelling any critical hit. You can download the rules`
    + ` and look at p8-9 for how attack actions work, specifically step4 on p9.`,
);
export const Brutal = new Note(
  `Brutal`,
  `Opponent can not do norm parries.`,
);
export const StunMelee = new Note(
  `Stun`,
  `In melee, first crit strike additionally discards 1 norm success of opponent. Second crit strike decrements opponent APL.`,
);
export const NicheAbility = new Note(
  `NicheAbility`,
  `Dueller is Intercession Squad chapter tactic; each crit parry discards additional 1 norm success of opponent.`
    + `  Hammerhand is Grey Knights psychic power; first strike deals +1 dmg.`
    + `  Storm Shield is a Custodes ability; each parry discards two successes of opponent instead of 1.`
);
export const Dummy = new Note(
  ``,
  ``,
);