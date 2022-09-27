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
  public rending: boolean; // a crit promotes a normal hit to a crit;
  public starfire: boolean; // a crit promotes a fail to a normal hit; shoot only
  public wounds: number; // fight only
  public fnp: number; // fight only
  public brutal: boolean; // fight only
  public stun: boolean; // fight only
  public autoNormHits: number;
  public noCover: NoCoverType;
  public abilities: Set<Ability>; // for {Dueller,StormShield,Hammerhand}; TODO add {rending, starfire, brutal, stun};

  public constructor(
    attacks: number = 4,
    bs: number = 3,
    normDmg: number = 3,
    critDmg: number = 4,
    mwx: number = 0,
    apx: number = 0,
    px: number = 0,
    reroll: Ability = Ability.None,
    lethal: number = 0,
    rending: boolean = false,
    starfire: boolean = false,
    wounds: number = 12,
    fnp: number = 0,
    brutal: boolean = false,
    stun: boolean = false,
    autoNormHits: number = 0,
    noCover: NoCoverType = NoCoverType.No,
    abilities: Set<Ability> = new Set<Ability>(),
  ) {
    this.attacks = attacks;
    this.bs = bs;
    this.normDmg = normDmg;
    this.critDmg = critDmg;
    this.mwx = mwx;
    this.apx = apx;
    this.px = px;
    this.reroll = reroll;
    this.lethal = lethal;
    this.rending = rending;
    this.starfire = starfire;
    this.wounds = wounds;
    this.fnp = fnp;
    this.brutal = brutal;
    this.stun = stun;
    this.autoNormHits = autoNormHits;
    this.noCover = noCover;
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