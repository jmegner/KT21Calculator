import Attacker from 'src/Attacker';
import Defender from 'src/Defender';
import { calcRemainingWounds, exportedForTesting } from 'src/CalcEngineFight';
import * as Util from 'src/Util';
import _ from 'lodash';
import Ability from 'src/Ability';
import FightStrategy from 'src/FightStrategy';
import FightChoice from 'src/FightChoice';
import FighterState from 'src/FighterState';

const {
  calcDieChoice,
  calcParryForLastEnemySuccessThenKillEnemy,
  resolveDieChoice,
  resolveFight,
  wiseParry,
} = exportedForTesting;

const requiredPrecision = 10;

function newFighterState(
  crits: number,
  norms: number,
  wounds: number = 3,
  strategy: FightStrategy = FightStrategy.MaxDmgToEnemy,
): FighterState {
  return new FighterState(
    new Attacker(crits + norms, 2, 1, 2).setProp('wounds', wounds),
    crits,
    norms,
    strategy,
  );
}

describe(wiseParry.name, () => {
  const guy1n = newFighterState(0, 1);
  const guy1c = newFighterState(1, 0);
  const guy1c1n = newFighterState(1, 1);

  it('1n vs 1n => norm parry', () => {
    expect(wiseParry(guy1n, guy1n)).toBe(FightChoice.NormParry);
  });
  it('1n vs 1c => norm strike', () => {
    expect(wiseParry(guy1n, guy1c)).toBe(FightChoice.NormStrike);
  });
  it('1n vs 1c+1n => norm parry', () => {
    expect(wiseParry(guy1n, guy1c1n)).toBe(FightChoice.NormParry);
  });
  it('1c vs 1n => crit parry', () => {
    expect(wiseParry(guy1c, guy1n)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1c => crit parry', () => {
    expect(wiseParry(guy1c, guy1c)).toBe(FightChoice.CritParry);
  });
  it('1c vs 1c+1n => crit parry', () => {
    expect(wiseParry(guy1c, guy1c1n)).toBe(FightChoice.CritParry);
  });
  it('1c+1n vs 1n => norm parry', () => {
    expect(wiseParry(guy1c1n, guy1n)).toBe(FightChoice.NormParry);
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
  const guy01 = newFighterState(0, 1);
  const guy10 = newFighterState(1, 0);

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
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, guy01)).toBe(FightChoice.NormParry);
  });
  it('typical crit parry', () => {
    expect(calcParryForLastEnemySuccessThenKillEnemy(guy99, guy10)).toBe(FightChoice.CritParry);
  });
});

describe(calcDieChoice.name + ', common & strike/parry', () => {
  it('#1: strike if you can kill with next strike', () => {
    const chooser = newFighterState(1, 1, 99, FightStrategy.Parry)
    const enemy = newFighterState(9, 9, chooser.profile.critDmg);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
  it('#2: parry if can parry last enemy success and still kill them', () => {
    const chooser = newFighterState(99, 99, 99, FightStrategy.Strike)
    const enemy = newFighterState(1, 0, 20);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
  it('MaxDmgToEnemy, parry lets you survive to give more damage', () => {
    const chooser = newFighterState(10, 0, 2, FightStrategy.MaxDmgToEnemy)
    const enemy = newFighterState(1, 1, 10, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritParry);
  });
  it('MaxDmgToEnemy, you\'re going to die, so strike', () => {
    const chooser = newFighterState(10, 10, 1, FightStrategy.MaxDmgToEnemy)
    const enemy = newFighterState(1, 1, 10, FightStrategy.Strike);
    expect(calcDieChoice(chooser, enemy)).toBe(FightChoice.CritStrike);
  });
});

describe(resolveFight.name + ' smart strategies should optimize goal', () => {
  it('"smart" strategies should not be outperformed by other strats', () => {
    const maxSuccesses = 4;
    const maxWounds = 6;
    let maxDmgBeatStrikeAtLeastOnce = false;
    let minDmgBeatParryAtLeastOnce = false;

    for(let wounds1 of _.range(maxWounds)) {
      for(let crits1 of _.range(maxSuccesses)) {
        for(let norms1 of _.range(maxSuccesses - crits1)) {
          for(let wounds2 of _.range(maxWounds)) {
            for(let crits2 of _.range(maxSuccesses)) {
              for(let norms2 of _.range(maxSuccesses - crits2)) {
                const chooserAlwaysStrike = newFighterState(crits1, norms1, wounds1, FightStrategy.Strike);
                const chooserAlwaysParry = newFighterState(crits1, norms1, wounds1, FightStrategy.Parry);
                const chooserMaxDmg = newFighterState(crits1, norms1, wounds1, FightStrategy.MaxDmgToEnemy);
                const chooserMinDmg = newFighterState(crits1, norms1, wounds1, FightStrategy.MinDmgToSelf);
                const enemyForAlwaysStrike = newFighterState(crits2, norms2, wounds2, FightStrategy.Strike);
                const enemyForAlwaysParry = _.clone(enemyForAlwaysStrike);
                const enemyForMaxDmg = _.clone(enemyForAlwaysStrike);
                const enemyForMinDmg = _.clone(enemyForAlwaysStrike);

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

    expect(maxDmgBeatStrikeAtLeastOnce).toBe(true);
    expect(minDmgBeatParryAtLeastOnce).toBe(true);
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

/*
describe('q', () => {
  it('x', () => {
    expect(0).toBe(0);
  });
});

*/