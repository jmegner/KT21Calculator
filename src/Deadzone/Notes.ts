import Note from 'src/Notes';

// Shared descriptions drive both hovertext and the notes beneath each calculator.
export function deadzoneNotes(isHaloFlashpoint: boolean): Note[] {
  const shared = [
    new Note(isHaloFlashpoint ? 'Rerolls/WeightOfFire' : 'Rerolls', isHaloFlashpoint
      ? 'Total failed dice to reroll once, including failures from bonus dice. Include Weight of Fire for Shoot tests and any other applicable rerolls; do not count the same rerolls twice.'
      : 'Number of failed dice to reroll once, including failures from bonus dice.'),
    new Note('AP', 'Armour Piercing reduces the target’s armour, to a minimum of zero. It does not bypass shields.'),
    new Note('Num Simulations', 'Samples used to estimate each dice test. More samples reduce random variation; 100K is recommended for comparisons.'),
  ];
  if (isHaloFlashpoint) {
    return [...shared,
      new Note('Ranged/Fight', 'Success threshold: use Ranged for Shoot or Fight for Assault. Lower is better. Dice should include terrain and command modifiers, but exclude bonuses from the special-rule controls below.'),
      new Note('Survive', 'Defender’s success threshold for both Shoot and Assault. Lower is better; winning the defence test causes no return damage.'),
      new Note('Lethal', 'Extra wounds after at least one wound gets through.'),
      new Note('Armour', 'Blocks remaining hits after shields; reduced by AP.'),
      new Note('ESD', 'Energy Shield Depleter: removes this many charged shields when hits are scored, before blocking those hits.'),
      new Note('Energy Shields', 'Currently charged shields, including applicable barriers. Each absorbs one hit and depletes.'),
      new Note('Headshots', 'Bonus-die threshold. X disables it. Optics/Scope override this to 7+; Guarded overrides them to X.'),
      new Note('Optics', 'Shoot: adds one die and sets Headshots to 7+.'),
      new Note('Sniper Scope', 'Enable for a long Shoot: adds two dice and sets Headshots to 7+.'),
      new Note('Guarded', 'Shoot: disables the attacker’s headshots, not the defender’s.'),
      new Note('Attacks', 'Consecutive attacks with fixed stats and depleting shields. No regeneration, healing, respawns or automatic changes to situational modifiers. Damage is not capped at Health.'),
      new Note('HeadshotLevels', 'Maximum bonus dice per original die. Unlimited follows normal play; Disabled prevents all bonus dice, including Optics/Scope headshots.'),
    ];
  }
  return [...shared,
    new Note('Stat(RA/FI/SV)', 'Success threshold on a D8: Ranged for shooting, Fight for melee, or Survive for defence. Lower is better.'),
    new Note('Toxic/Dismantle', 'Extra damage only if at least one point gets through shields and armour. Enter Toxic’s value, or 1 for Dismantle against a vehicle.'),
    new Note('Armor', 'Damage reduction after shields, reduced by the opponent’s AP to a minimum of zero.'),
    new Note('ShieldDice', 'Number of shield dice rolled when hit. Each 6+ blocks one damage before armour. Shield rolls do not explode in this calculator.'),
    new Note('DiceExplodeOn', 'Roll an extra die for each result at or above this threshold; bonus dice can also explode. Normally 8+.'),
    new Note('FightBack?', 'Enable for opposed Fight tests where the defender can damage the attacker. Disable for shooting or a defender using Survive. Negative results mean damage to the attacker.'),
    new Note('Rounds', 'Repeats the same damage distribution this many times. Stats stay fixed; damage is not capped at HP and attacks do not stop on death.'),
    new Note('ExplodingDiceLevels', 'Maximum bonus dice per original die. Unlimited allows the normal chain; Disabled prevents explosions; 1 allows one bonus die.'),
  ];
}

export function explainDeadzoneControls<T extends {id: string; hoverText?: string}>(controls: T[], isHaloFlashpoint: boolean): void {
  const notes = new Map(deadzoneNotes(isHaloFlashpoint).map(note => [note.name, note.description]));
  controls.forEach(control => { control.hoverText = notes.get(control.id); });
}
