import { clone } from "lodash";
import Ability from "src/Ability";
import DieProbs from "src/DieProbs";
import * as Util from 'src/Util';
import NoCoverType from "./NoCoverType";

export default class Attacker {
  public attacks: number;
  public bs: number;
  public normDmg: number;
  public critDmg: number;
  public mwx: number; // shoot only
  public apx: number; // shoot only
  public px: number; // shoot only
  public reroll: Ability;
  public lethal: number; // 0 means default of crit on 6+; can be 7 to force never-crit
  public wounds: number; // fight only
  public fnp: number; // fight only
  public autoNormHits: number;
  public autoNormCrits: number;
  public noCover: NoCoverType;
  public abilities: Set<Ability>; // for basically all bool abilities

  public constructor(
    attacks: number = 4,
    bs: number = 3,
    normDmg: number = 3,
    critDmg: number = 4,
    mwx: number = 0,
    abilities: Set<Ability> = new Set<Ability>(),
  ) {
    this.attacks = attacks;
    this.bs = bs;
    this.normDmg = normDmg;
    this.critDmg = critDmg;
    this.mwx = mwx;
    this.apx = 0;
    this.px = 0;
    this.reroll = Ability.None;
    this.lethal = 0;
    this.wounds = 12;
    this.fnp = 0;
    this.autoNormHits = 0;
    this.autoNormCrits = 0;
    this.noCover = NoCoverType.No;
    this.abilities = abilities;
  }

  public static justDamage(
    normalDamage: number,
    criticalDamage: number = 0,
    mwx: number = 0
  ) : Attacker
  {
    return new Attacker(0, 0, normalDamage, criticalDamage, mwx);
  }

  public critSkill(): number {
    return this.lethal === 0 ? 6 : this.lethal;
  }

  //#ERROR TODO: look at all uses of possibleDmg to see if okay to not include hammerhand
  public possibleDmg(crits: number, norms: number): number {
    return crits * (this.critDmg + this.mwx) + norms * this.normDmg;
  }

  public cancelsPerParry(): number {
    return this.abilities.has(Ability.StormShield) ? 2 : 1;
  }

  public toDieProbs(): DieProbs {
    return DieProbs.fromSkills(this.critSkill(), this.bs, this.reroll);
  }

  public setProp(propName: keyof Attacker, value: number | Ability | boolean | Set<Ability>) : Attacker {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Attacker, value: number | Ability | boolean | Set<Ability>) : Attacker {
    const copy = clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public has(ability: Ability): boolean {
    if(this.reroll === ability) {
      return true;
    }
    return this.abilities.has(ability);
  }

  public setAbility(ability: Ability, addIt: boolean): Attacker {
    Util.addOrRemove(this.abilities, ability, addIt);
    return this;
  }

  public withAlwaysNormHit() : Attacker {
    return this.withProp('bs', 1).setProp('lethal', 7);
  }

  public withAlwaysCritHit() : Attacker {
    return this.withProp('bs', 1).setProp('lethal', 1);
  }
}