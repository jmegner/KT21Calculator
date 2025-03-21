import Model from 'src/Model';
import {
  calcRemainingWounds,
} from 'src/CalcEngineFight';
import {
  calcDieChoice,
  calcParryForLastEnemySuccessThenKillEnemy,
  calcRemainingWoundPairProbs,
  resolveDieChoice,
  resolveFight,
  toWoundPairKey,
  wiseParry,
} from 'src/CalcEngineFightInternal';
import {clone, range} from 'lodash';
import FightStrategy from 'src/FightStrategy';
import FightChoice from 'src/FightChoice';
import FighterState from 'src/FighterState';
import Ability from 'src/Ability';
import * as Util from 'src/Util';

const requiredPrecision = 10;

function newFighterState(
  crits: number,
  norms: number,
  wounds: number = 3,
  strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
  abilities: Set<Ability> = new Set<Ability>(),
): FighterState {
  return new FighterState(
    new Model(crits + norms, 2, 1, 2)
      .setProp('wounds', wounds)
      .setProp('abilities', abilities),
    crits,
    norms,
    strategy,
  );
}

describe(wiseParry.name, () => {
  const guy1n = newFighterState(0, 1);
  const guy1c = newFighterState(1, 0);
  const guy1c1n = newFighterState(1, 1);
  const guy1nBrutal = newFighterState(0, 1);
  const guy1cBrutal = newFighterState(1, 0);
  guy1nBrutal.profile.setAbility(Ability.Brutal, true);
  guy1cBrutal.profile.setAbility(Ability.Brutal, true);

  it('1n vs 1n => norm parry', () => {
    expect(wiseParry(guy1n, guy1n)).toBe(FightChoice.NormParry);
  });
  it('1n vs 1n brutal => norm strike', () => {
    expect(wiseParry(guy1n, guy1nBrutal)).toBe(FightChoice.NormStrike);
  });
  it('1n vs 1c => norm strike', () => {
    expect(wiseParry(guy1n, guy1c)).toBe(FightChoice.NormStrike);
  });
  it('1n vs 1c brutal => norm strike', () => {
    expect(wiseParry(guy1n, guy1cBrutal)).toBe(FightChoice.NormStrike);
  });
  it('1n vs 1c+1n => norm parry', () => {
    expect(wiseParry(guy1n, guy1c1n)).toBe(FightChoice.NormParry);
  });
  it('1c vs 1n => crit parry', () => {
    expect(wiseParry(guy1c, guy1n)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1n brutal => crit parry', () => {
    expect(wiseParry(guy1c, guy1nBrutal)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1c => crit parry', () => {
    expect(wiseParry(guy1c, guy1c)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1c brutal => crit parry', () => {
    expect(wiseParry(guy1c, guy1cBrutal)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1c+1n => crit parry', () => {
    expect(wiseParry(guy1c, guy1c1n)).toBe(FightChoice.CritParry);
  });
  it('1c+1n vs 1n => norm parry', () => {
    expect(wiseParry(guy1c1n, guy1n)).toBe(FightChoice.NormParry);
  });
  it('1c+1n vs 1n brutal => crit parry', () => {
    expect(wiseParry(guy1c1n, guy1nBrutal)).toBe(FightChoice.CritParry);
  });
  it('1c+1n vs 1c => crit parry', () => {
    expect(wiseParry(guy1c1n, guy1c)).toBe(FightChoice.CritParry);
  });
  it('1c+1n vs 1c+1n => crit parry', () => {
    expect(wiseParry(guy1c1n, guy1c1n)).toBe(FightChoice.CritParry);
  });
});

describe(calcParryForLastEnemySuccessThenKillEnemy.name, () => {
  const guy99 = newFighterState(9, 9);
  guy99.profile.critDmg = 3;
  guy99.profile.normDmg = 2;

  it('no parry because multiple enemy success', () => {
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(1, 1))).toBe(null);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(0, 2))).toBe(null);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(2, 0))).toBe(null);
  });
  it('no parry because too much enemy health', () => {
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(0, 1, guy99.totalDmg()))).toBe(null);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(0, 1, guy99.totalDmg() - guy99.profile.normDmg + 1))).toBe(null);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(1, 0, guy99.totalDmg() - guy99.profile.critDmg + 1))).toBe(null);
  });
  it('typical norm parry', () => {
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(0, 1))).toBe(FightChoice.NormParry);
  });
  it('brutal requiring crit parry instead of norm parry', () => {
    const guy01Brutal = newFighterState(0, 1);
    guy01Brutal.profile.setAbility(Ability.Brutal, true);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, guy01Brutal)).toBe(FightChoice.CritParry);
  });
  it('typical crit parry', () => {
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, newFighterState(1, 0))).toBe(FightChoice.CritParry);
  });
  it('crit and norm parry with storm shield', () => {
    const guy99Storm = newFighterState(9, 9);
    guy99Storm.profile.abilities.add(Ability.StormShield2021);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Storm, newFighterState(2, 0))).toBe(FightChoice.CritParry);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Storm, newFighterState(1, 1))).toBe(FightChoice.CritParry);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Storm, newFighterState(0, 2))).toBe(FightChoice.NormParry);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Storm, newFighterState(1, 2))).toBe(null);
  });
  it('crit parry with Dueller', () => {
    const guy99Dueller = newFighterState(9, 9);
    guy99Dueller.profile.abilities.add(Ability.Dueller);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Dueller, newFighterState(2, 0))).toBe(null);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Dueller, newFighterState(1, 1))).toBe(FightChoice.CritParry);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Dueller, newFighterState(0, 2))).toBe(FightChoice.CritParry);
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99Dueller, newFighterState(1, 2))).toBe(null);
  });
});

describe(calcDieChoice.name + ', common & strike/parry', () => {
  it('#1a: strike if you can kill with next strike', () => {
    const chooser = newFighterState(1, 1, 99, FightStrategy.Parry);
    const enemy = newFighterState(9, 9, chooser.profile.critDmg);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('#1b: strike if you can kill with next strike (hammerhand)', () => {
    const chooser = newFighterState(1, 1, 99, FightStrategy.Parry, new Set<Ability>([Ability.Hammerhand2021]));
    const enemy = newFighterState(9, 9, chooser.profile.critDmg + 1);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('#2a: crit strike if you have stun, enemy is not already stunned, and enemy has no crit successes', () => {
    const chooser = newFighterState(99, 99, 99, FightStrategy.Parry, new Set<Ability>([Ability.Stun2021]));
    const enemy = newFighterState(0, 99, 20);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('#2b: if enemy already stunned, then cannot stun again', () => {
    const chooser = newFighterState(99, 99, 99, FightStrategy.Parry, new Set<Ability>([Ability.Stun2021]));
    chooser.hasCritStruck = true;
    const enemy = newFighterState(0, 99, 20);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.NormParry);
  });
  it('#2c: if chooser has stun and enemy has crit successes, that is not enough to override Parry strategy', () => {
    const chooser = newFighterState(99, 99, 99, FightStrategy.Parry, new Set<Ability>([Ability.Stun2021]));
    const enemy = newFighterState(99, 99, 20);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
  it('#3: parry if can parry last enemy success and still kill them', () => {
    const chooser = newFighterState(99, 99, 99, FightStrategy.Strike);
    const enemy = newFighterState(1, 0, 20);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
  it('MaxDmgToEnemy, parry lets you survive to give more damage', () => {
    const chooser = newFighterState(10, 0, 2, FightStrategy.MaxDmgToEnemy);
    const enemy = newFighterState(1, 1, 10, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
  it('MaxDmgToEnemy, you\'re going to die, so strike', () => {
    const chooser = newFighterState(10, 10, 1, FightStrategy.MaxDmgToEnemy);
    const enemy = newFighterState(1, 1, 10, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('MinDmgToSelf, you\'re going to die, so strike', () => {
    const chooser = newFighterState(10, 10, 1, FightStrategy.MinDmgToSelf);
    const enemy = newFighterState(1, 1, 10, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('MinDmgToSelf, do not use stunning crit strike if could have used that crit to parry an enemy crit', () => {
    const chooser = newFighterState(1, 1, 99, FightStrategy.MinDmgToSelf, new Set<Ability>([Ability.Stun2021]));
    const enemy = newFighterState(1, 1, 99, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
});

describe(resolveDieChoice.name + ': basic, stun, storm shield, hammerhand, dueller', () => {
  const origChooserCrits = 10;
  const origChooserNorms = 20;
  const origEnemyCrits = 30;
  const origEnemyNorms = 40;
  const finalWounds = 100;

  function makeChooser(...abilities: Ability[]): FighterState {
    return newFighterState(
      origChooserCrits,
      origChooserNorms,
      finalWounds,
      FightStrategy.MaxDmgToEnemy,
      new Set<Ability>(abilities));
  }
  function makeEnemy(wounds: number = finalWounds): FighterState {
    return newFighterState(
      origEnemyCrits,
      origEnemyNorms,
      wounds,
    );
  }

  it('CritStrike+noStun, and check even values that shouldn\'t change', () => {
    for(let stormShieldMaybe of [Ability.None, Ability.StormShield2021]) { // storm shield shouldn't matter
      const chooser = makeChooser(stormShieldMaybe);
      const enemy = makeEnemy(chooser.profile.critDmg + finalWounds);

      resolveDieChoice(FightChoice.CritStrike, chooser, enemy);
      expect(chooser.crits).toBe(origChooserCrits - 1);
      expect(chooser.norms).toBe(origChooserNorms);
      expect(chooser.currentWounds).toBe(finalWounds);
      expect(enemy.crits).toBe(origEnemyCrits);
      expect(enemy.norms).toBe(origEnemyNorms);
      expect(enemy.currentWounds).toBe(finalWounds);
    }
  });
  it('CritStrike+stun, not already stunned', () => {
    for(let stormShield of [false, true]) { // storm shield shouldn't matter
      const chooser = makeChooser(Ability.Stun2021, stormShield ? Ability.StormShield2021 : Ability.None);
      chooser.profile.setAbility(Ability.Stun2021, true);
      const enemy = makeEnemy(chooser.profile.critDmg + finalWounds);

      resolveDieChoice(FightChoice.CritStrike, chooser, enemy);
      expect(chooser.crits).toBe(origChooserCrits - 1);
      expect(chooser.norms).toBe(origChooserNorms);
      expect(chooser.currentWounds).toBe(finalWounds);
      expect(enemy.crits).toBe(origEnemyCrits);
      expect(enemy.norms).toBe(origEnemyNorms - 1);
      expect(enemy.currentWounds).toBe(finalWounds);
    }
  });
  it('CritStrike+stun, already stunned', () => {
    for(let stormShieldMaybe of [Ability.None, Ability.StormShield2021]) { // storm shield shouldn't matter
      const chooser = makeChooser(Ability.Stun2021, stormShieldMaybe);
      chooser.hasCritStruck = true;
      const enemy = makeEnemy(chooser.profile.critDmg + finalWounds);

      resolveDieChoice(FightChoice.CritStrike, chooser, enemy);
      expect(chooser.crits).toBe(origChooserCrits - 1);
      expect(chooser.norms).toBe(origChooserNorms);
      expect(chooser.currentWounds).toBe(finalWounds);
      expect(enemy.crits).toBe(origEnemyCrits);
      expect(enemy.norms).toBe(origEnemyNorms);
      expect(enemy.currentWounds).toBe(finalWounds);
    }
  });
  it('NormStrike', () => {
    for(let stunAndStormShield of [false, true]) { // neither should matter
      const chooser = makeChooser();
      chooser.profile.setAbility(Ability.StormShield2021, stunAndStormShield);
      chooser.profile.setAbility(Ability.Stun2021, stunAndStormShield);
      const enemy = makeEnemy(chooser.profile.normDmg + finalWounds);

      resolveDieChoice(FightChoice.NormStrike, chooser, enemy);
      expect(chooser.crits).toBe(origChooserCrits);
      expect(chooser.norms).toBe(origChooserNorms - 1);
      expect(chooser.currentWounds).toBe(finalWounds);
      expect(enemy.crits).toBe(origEnemyCrits);
      expect(enemy.norms).toBe(origEnemyNorms);
      expect(enemy.currentWounds).toBe(finalWounds);
    }
  });
  it('CritParry to cancel enemy crit', () => {
    const chooser = makeChooser();
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits - 1);
    expect(enemy.norms).toBe(origEnemyNorms);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry to cancel enemy norm (no enemy crits)', () => {
    const chooser = makeChooser();
    const enemy = newFighterState(0, origEnemyNorms, finalWounds);

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(0);
    expect(enemy.norms).toBe(origEnemyNorms - 1);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('NormParry to cancel enemy norm', () => {
    const chooser = makeChooser();
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.NormParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits);
    expect(chooser.norms).toBe(origChooserNorms - 1);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits);
    expect(enemy.norms).toBe(origEnemyNorms - 1);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry with storm shield to cancel 2 enemy crits', () => {
    const chooser = makeChooser(Ability.StormShield2021);
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits - 2);
    expect(enemy.norms).toBe(origEnemyNorms);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry with StormShield or Dueller to cancel 1 enemy crit & 1 enemy norm', () => {
    const chooser = makeChooser(Ability.StormShield2021);
    const enemy = newFighterState(1, origEnemyNorms, finalWounds);

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(0);
    expect(enemy.norms).toBe(origEnemyNorms - 1);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry with storm shield to cancel 2 enemy norms', () => {
    const chooser = makeChooser(Ability.StormShield2021);
    const enemy = newFighterState(0, origEnemyNorms, finalWounds);

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(0);
    expect(enemy.norms).toBe(origEnemyNorms - 2);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('NormParry with storm shield to cancel 2 enemy norms', () => {
    const chooser = makeChooser(Ability.StormShield2021);
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.NormParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits);
    expect(chooser.norms).toBe(origChooserNorms - 1);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits);
    expect(enemy.norms).toBe(origEnemyNorms - 2);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry with Dueller to cancel 1 enemy crit and 1 enemy norm', () => {
    const chooser = makeChooser(Ability.Dueller);
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits - 1);
    expect(enemy.norms).toBe(origEnemyNorms - 1);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('CritParry with Dueller to cancel 2 enemy norms (because no enemy crits)', () => {
    const chooser = makeChooser(Ability.Dueller);
    const enemy = newFighterState(0, origEnemyNorms, finalWounds);

    resolveDieChoice(FightChoice.CritParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits - 1);
    expect(chooser.norms).toBe(origChooserNorms);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(0);
    expect(enemy.norms).toBe(origEnemyNorms - 2);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('NormParry with Dueller to cancel 1 enemy norm', () => {
    const chooser = makeChooser(Ability.Dueller);
    const enemy = makeEnemy();

    resolveDieChoice(FightChoice.NormParry, chooser, enemy);
    expect(chooser.crits).toBe(origChooserCrits);
    expect(chooser.norms).toBe(origChooserNorms - 1);
    expect(chooser.currentWounds).toBe(finalWounds);
    expect(enemy.crits).toBe(origEnemyCrits);
    expect(enemy.norms).toBe(origEnemyNorms - 1);
    expect(enemy.currentWounds).toBe(finalWounds);
  });
  it('hammerhand 1st hit deals extra damage and 2nd hit does not', () => {
    const initialWounds = 100;
    const chooser = makeChooser(Ability.Hammerhand2021);
    const enemy = makeEnemy(initialWounds);

    resolveDieChoice(FightChoice.NormStrike, chooser, enemy);
    expect(enemy.currentWounds).toBe(initialWounds - chooser.profile.normDmg - 1);
    resolveDieChoice(FightChoice.NormStrike, chooser, enemy);
    expect(enemy.currentWounds).toBe(initialWounds - 2 * chooser.profile.normDmg - 1);
  });
});

describe(resolveFight.name + ' smart strategies should optimize goal', () => {
  it('"smart" strategies should not be outperformed by other strats', () => {
    const maxSuccesses = 3;
    const maxWounds = 4;
    let maxDmgBeatStrikeAtLeastOnce = false;
    let minDmgBeatParryAtLeastOnce = false;

    for(let wounds1 of range(maxWounds)) {
      for(let crits1 of range(maxSuccesses)) {
        for(let norms1 of range(maxSuccesses - crits1)) {
          for(let wounds2 of range(maxWounds)) {
            for(let crits2 of range(maxSuccesses)) {
              for(let norms2 of range(maxSuccesses - crits2)) {
                for(let stun of [false, true]) {
                    for(let stormShield of [false, true]) {
                    const abilities = new Set<Ability>();
                    Util.addOrRemove(abilities, Ability.Stun2021, stun);
                    Util.addOrRemove(abilities, Ability.StormShield2021, stormShield);
                    const chooserAlwaysStrike = newFighterState(crits1, norms1, wounds1, FightStrategy.Strike, abilities);
                    const chooserAlwaysParry = newFighterState(crits1, norms1, wounds1, FightStrategy.Parry, abilities);
                    const chooserMaxDmg = newFighterState(crits1, norms1, wounds1, FightStrategy.MaxDmgToEnemy, abilities);
                    const chooserMinDmg = newFighterState(crits1, norms1, wounds1, FightStrategy.MinDmgToSelf, abilities);
                    const enemyForAlwaysStrike = newFighterState(crits2, norms2, wounds2, FightStrategy.Strike);
                    const enemyForAlwaysParry = clone(enemyForAlwaysStrike);
                    const enemyForMaxDmg = clone(enemyForAlwaysStrike);
                    const enemyForMinDmg = clone(enemyForAlwaysStrike);

                    resolveFight(chooserAlwaysStrike, enemyForAlwaysStrike);
                    resolveFight(chooserAlwaysParry, enemyForAlwaysParry);
                    resolveFight(chooserMaxDmg, enemyForMaxDmg);
                    resolveFight(chooserMinDmg, enemyForMinDmg);

                    expect(chooserAlwaysStrike.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(chooserAlwaysParry.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(chooserMaxDmg.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(chooserMinDmg.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(enemyForAlwaysStrike.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(enemyForAlwaysParry.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(enemyForMaxDmg.currentWounds).toBeGreaterThanOrEqual(0);
                    expect(enemyForMinDmg.currentWounds).toBeGreaterThanOrEqual(0);

                    expect(enemyForMaxDmg.currentWounds).toBeLessThanOrEqual(enemyForAlwaysStrike.currentWounds);
                    expect(enemyForMaxDmg.currentWounds).toBeLessThanOrEqual(enemyForAlwaysParry.currentWounds);
                    expect(enemyForMaxDmg.currentWounds).toBeLessThanOrEqual(enemyForMinDmg.currentWounds);

                    expect(chooserMinDmg.currentWounds).toBeGreaterThanOrEqual(chooserAlwaysStrike.currentWounds);
                    expect(chooserMinDmg.currentWounds).toBeGreaterThanOrEqual(chooserAlwaysParry.currentWounds);
                    expect(chooserMinDmg.currentWounds).toBeGreaterThanOrEqual(chooserMaxDmg.currentWounds);

                    if(enemyForMaxDmg.currentWounds < enemyForAlwaysStrike.currentWounds) {
                      maxDmgBeatStrikeAtLeastOnce = true;
                    }

                    if(chooserMinDmg.currentWounds > chooserAlwaysParry.currentWounds) {
                      minDmgBeatParryAtLeastOnce = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    //expect(maxDmgBeatStrikeAtLeastOnce).toBe(true);
    //expect(minDmgBeatParryAtLeastOnce).toBe(true);
  });
});

describe(resolveFight.name + 'hardcoded answers', () => {
  it('guy1 kill guy2 in 1 crit strike', () => {
    const guy1 = newFighterState(1, 1, 1);
    const guy2 = newFighterState(1, 1, 2);

    resolveFight(guy1, guy2);
    expect(guy1.currentWounds).toBe(guy1.profile.wounds);
    expect(guy2.currentWounds).toBe(0);
  });
  it('guy1 parry once then kill guy2', () => {
    const guy1 = newFighterState(2, 1, 1);
    const guy2 = newFighterState(0, 1, 4);

    resolveFight(guy1, guy2);
    expect(guy1.currentWounds).toBe(guy1.profile.wounds);
    expect(guy2.currentWounds).toBe(0);
  });
  it('guy1 vs guy2 many strikes', () => {
    const guy1 = newFighterState(2, 1, 5, FightStrategy.Strike);
    const guy2 = newFighterState(2, 1, 5, FightStrategy.Strike);

    resolveFight(guy1, guy2);
    expect(guy1.currentWounds).toBe(1);
    expect(guy2.currentWounds).toBe(0);
  });
});

describe(calcRemainingWounds.name + ' basic', () => {
  const pc = 1 / 6;
  const pf = 1 - pc;
  const w = 5;
  const dn = 3;
  const dc = 4;

  it('fight can\'t be cut short', () => {
    const guy1 = new Model(1, 6, dn, dc).setProp('wounds', w);
    const guy2 = clone(guy1);

    const [guy1Wounds, guy2Wounds] = calcRemainingWounds(guy1, guy2, FightStrategy.Strike, FightStrategy.Strike);
    expect(guy1Wounds.get(w)).toBeCloseTo(pf, requiredPrecision);
    expect(guy1Wounds.get(w - dc)).toBeCloseTo(pc, requiredPrecision);
    expect(guy2Wounds.get(w)).toBeCloseTo(pf, requiredPrecision);
    expect(guy2Wounds.get(w - dc)).toBeCloseTo(pc, requiredPrecision);
  });
  it('fight can be cut short', () => {
    const guy1 = new Model(1, 6, dn, dc).setProp('wounds', dc);
    const guy2 = clone(guy1);

    const [guy1Wounds, guy2Wounds] = calcRemainingWounds(guy1, guy2, FightStrategy.Strike, FightStrategy.Strike);
    expect(guy1Wounds.get(0)).toBeCloseTo(pf * pc, requiredPrecision);
    expect(guy1Wounds.get(dc)).toBeCloseTo(pc + pf * pf, requiredPrecision);
    expect(guy2Wounds.get(0)).toBeCloseTo(pc, requiredPrecision);
    expect(guy2Wounds.get(dc)).toBeCloseTo(pf, requiredPrecision);
  });
  it('WS=6+ and Lethal=4+ should be handled same as WS=4+ and Lethal=4+', () => {
    const guy1 = new Model(1, 2, 1, 1).setProp('wounds', 2);
    const guy2a = new Model(1, 4, 1, 2).setProp('wounds', 1).setProp('lethal', 4);
    const guy2b = new Model(1, 6, 1, 2).setProp('wounds', 1).setProp('lethal', 4);

    const [guy1AWounds, guy2AWounds] = calcRemainingWounds(guy1, guy2a, FightStrategy.Strike, FightStrategy.Strike);
    const [guy1BWounds, guy2BWounds] = calcRemainingWounds(guy1, guy2b, FightStrategy.Strike, FightStrategy.Strike);
    expect(guy1AWounds).toEqual(guy1BWounds);
  });
});

describe(calcRemainingWounds.name + ' multiple rounds', () => {
  const pc = 1 / 6;
  const pf = 1 - pc;
  const w = 5;
  const dn = 3;
  const dc = 4;

  it('double fight where fight1 can\'t be fatal', () => {
    const guy1 = new Model(1, 6, dn, dc).setProp('wounds', w);
    const guy2 = clone(guy1);

    const [guy1Wounds, guy2Wounds] = calcRemainingWounds(guy1, guy2, FightStrategy.Strike, FightStrategy.Strike, 2);
    // rolls, then hits taken, then prob
    // 1 2 1 2  x1  x2  prob
    // ---------------------
    // f f f f, 0, 0, f4c0
    // f f f c, 1, 0, f3c1
    // f f c f, 0, 1, f3c1
    // f f c c, 1, 1, f2c2
    // f c f f, 1, 0, f3c1
    // f c f c, 2, 0, f2c2
    // f c c f, 1, 1, f2c2
    // f c c c, 2, 1, f1c3
    // c f f f, 0, 1, f3c1
    // c f f c, 1, 1, f2c2
    // c f c f, 0, 2, f2c2, guy2 dies before his second action
    // c f c c, 0, 2, f1c3, guy2 dies before his second action
    // c c f f, 1, 1, f2c2
    // c c f c, 2, 1, f1c3
    // c c c f, 1, 2, f1c3, guy2 dies before his second action
    // c c c c, 1, 2, f0c4, guy2 dies before his second action
    const h0 = w; // hits taken = 0
    const h1 = w - dc; // hits taken = 1
    const h2 = 0; // hits taken = 2
    const f4c0 = Math.pow(pf, 4);
    const f3c1 = Math.pow(pf, 3) * pc;
    const f2c2 = pf * pf * pc * pc;
    const f1c3 = pf * Math.pow(pc, 3);
    const f0c4 = Math.pow(pc, 4);

    expect(guy1Wounds.size).toBe(3);
    expect(guy2Wounds.size).toBe(3);
    expect(guy1Wounds.get(h0)).toBeCloseTo(f4c0 + f3c1 * 2 + f2c2     + f1c3           , requiredPrecision);
    expect(guy1Wounds.get(h1)).toBeCloseTo(       f3c1 * 2 + f2c2 * 4 + f1c3     + f0c4, requiredPrecision);
    expect(guy1Wounds.get(h2)).toBeCloseTo(                  f2c2     + f1c3 * 2       , requiredPrecision);
    expect(guy2Wounds.get(h0)).toBeCloseTo(f4c0 + f3c1 * 2 + f2c2                      , requiredPrecision);
    expect(guy2Wounds.get(h1)).toBeCloseTo(       f3c1 * 2 + f2c2 * 4 + f1c3 * 2       , requiredPrecision);
    expect(guy2Wounds.get(h2)).toBeCloseTo(                  f2c2     + f1c3 * 2 + f0c4, requiredPrecision);
  });
  it('double fight with possibly fatal fight1', () => {
    const guy1 = new Model(1, 6, dn, dc).setProp('wounds', dc);
    const guy2 = clone(guy1);

    // rolls, then remaining health, then prob
    // 1 2 1 2  w1  w2  prob
    // ---------------------
    // f f f f, dc, dc, f4c0
    // f f f c,  0, dc, f3c1
    // f f c x, dc,  0, f2c1
    // f c x x,  0, dc, f1c1
    // c x x x, dc,  0, f0c1
    //const [guy1Wounds, guy2Wounds] = calcRemainingWounds(guy1, guy2, FightStrategy.Strike, FightStrategy.Strike, 2);
    const woundPairProbs = calcRemainingWoundPairProbs(guy1, guy2, FightStrategy.Strike, FightStrategy.Strike, 2);
    expect(woundPairProbs.size).toBe(3);
    expect(woundPairProbs.get(toWoundPairKey(dc, dc))).toBeCloseTo(Math.pow(pf, 4), requiredPrecision);
    expect(woundPairProbs.get(toWoundPairKey(0, dc))).toBeCloseTo(Math.pow(pf, 3) * pc + pf * pc, requiredPrecision);
    expect(woundPairProbs.get(toWoundPairKey(dc, 0))).toBeCloseTo(pf * pf * pc + pc, requiredPrecision);
  });
});
