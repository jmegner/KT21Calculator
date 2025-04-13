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
  `Balanced rerolls 1 die.  Relentless rerolls fails.`
    + `  MostCommonFail rerolls most common fail result (ex: reroll 2s); it's called "ceaseless" in KT2024.`
    + `  CritFishRelentless rerolls non-crits.`
    + `  DoubleBalanced rerolls 2 dice.`
    + `  Ones rerolls 1s ("ceaseless" in KT2021).`
    + `  BothOnesAndBalanced rerolls 1s and then rerolls 1 die that hasn't already been rerolled.`
    ,
);
export const NoCover = new Note(
  `NoCover`,
  `Defender can not use cover saves. Intercession Squad's Accurate chapter tactic triggers this only if a crit hit is retained.`,
);
export const ObscuredTarget = new Note(
  `ObscuredTarget`,
  `Attacker crits are retained as norms.  No crit-triggered abilities can trigger.  Discard an attacker success.`,
);
export const AutoNorms = new Note(
  `AutoNorms/Accurate`,
  `How many attack dice can be automatically retained as a normal success. Much like cover saves but for attack dice.`,
);
export const AutoCrits = new Note(
  `AutoCrits`,
  `How many attack dice can be automatically retained as a crit success. Much like cover saves but for attack dice.`,
);
export const FailsToNorms = new Note(
  `FailsToNorms`,
  `How many fails can be modified to normal successes.`,
);
export const NormsToCrits = new Note(
  `NormsToCrits`,
  `How many normal successes can be modified to critical successes.`,
);
export const CloseAssault2021 = new Note(
  `CloseAssault2021`,
  `If you have two or more sucesses, promote a fail to a normal success.  Imperial Navy Breachers strategic ploy.`,
);
export const Waaagh2021 = new Note(
  `Waaagh2021`,
  `If you have two or more normal sucesses, promote a norm to a crit.  Kommandos strategic ploy.`,
);
export const EliteModerate2021 = new Note(
  `EliteModerate2021`,
  `In spending of Kasrkin Elite points, upgrade a fail to a norm or a norm to a crit.`,
);
export const EliteExtreme2021 = new Note(
  `EliteExtreme2021`,
  `In spending of Kasrkin Elite points, upgrade a fail to a crit.`,
);
export const Rending = new Note(
  `Rending`,
  `If you have >=1 crit, you can modify a norm to a crit.`,
);
export const Severe = new Note(
  `Severe`,
  `If you have no crits, you can modify a norm to a crit.`,
);
export const FailToNormIfCrit = new Note(
  `Punishing/FailToNormIfCrit`,
  `Modify a failed hit into a normal hit if you had at least one critical hit; Necron equipment Starfire Core, Kommando strategic ploy "Dakka! Dakka! Dakka!", Hive Fleet equipment Toxin Sacs, Corsair Voidscarred strategic ploy Outcasts.`,
);
export const CoverNormSaves = new Note(
  `CoverNormSaves`,
  `How many saves can be automatically retained as a normal success. High enough APx/Px can limit these auto-saves.`,
);
export const CoverCritSaves = new Note(
  `CoverCritSaves`,
  `How many saves can be automatically retained as a critical success. High enough APx/Px can limit these auto-saves.`,
);
export const JustAScratch2021 = new Note(
  `JustAScratch2021`,
  `Kommandos Tactical Ploy to ignore damage from a chosen attack die.`,
);
export const PuritySeal = new Note(
  `PuritySeal`,
  `If roll 2 fails, can discard one fail to change other fail to normal success; shooting and fighting only.`,
);
export const InvulnSave = new Note(
  `InvulnSave`,
  `Save value that ignores APx/Px.  If you choose a valid value, InvulnSave will be used even if using Save would be better.`,
);
export const HardyX = new Note(
  `HardyX`,
  `HardyX is like Lethal (changes what values give you a critical success), but for defense. Name comes from Intercession Squad chapter tactic Hardy.`,
);
export const Durable2021 = new Note(
  `Durable2021`,
  `Durable: in the Resolve Successful Hits step of a combat or shooting attack, one critical hit inflicts one less damage on this operative (to a minimum of 3).`,
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
export const Shock = new Note(
  `Shock`,
  `First crit strike also cancels enemy unresolved norm (or crit if no norms).`,
);
export const StunMelee2021 = new Note(
  `Stun2021`,
  `In KT2021, in melee, first crit strike additionally discards 1 norm success of opponent. Second crit strike decrements opponent APL.`,
);
export const NicheAbility = new Note(
  `NicheAbility`,
  `Dueller2021 is Intercession Squad chapter tactic; each crit parry discards additional 1 norm success of opponent.`
    + `  Hammerhand2021 is Grey Knights psychic power; first strike deals +1 dmg.`
    + `  StormShield2021 is a Custodes ability; each parry discards two successes of opponent instead of 1.`
    + `  MurderousEntrance2021 is a Void Troupe tactical ploy to strike again after a crit strike.`
);
export const Duelist = new Note(
  `Duelist/PreParry`,
  `Do one parry before usual dice resolution.`,
);
export const Dummy = new Note(
  ``,
  ``,
);

// World Of Tanks...

export const Deadeye = new Note(
  `Deadeye`,
  `For each crit, attacker draws two crit cards and chooses which one to use.`,
);
export const TargetHullDown = new Note(
  `TargetHullDown`,
  `If target is 'hull down', then attacker discards a normal hit.`,
);
export const HighExplosive = new Note(
  `HighExplosive`,
  `Attacker discards all normal hits before Assessing Damage.`,
);