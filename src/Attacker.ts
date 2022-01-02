import _ from "lodash";
import Ability from "./Ability";

export default class Attacker {
  public attacks: number;
  public bs: number;
  public normalDamage: number;
  public criticalDamage: number;
  public mwx: number;
  public apx: number;
  public px: number;
  public reroll: Ability;
  public lethalx: number; // 0 means default of crit on 6+; can be 7 to force never-crit
  public rending: boolean; // a crit promotes a normal hit to a crit;
  public starfire: boolean; // a crit promotes a fail to a normal hit;

  public constructor(
    attacks: number = 4,
    bs: number = 3,
    normalDamage: number = 3,
    criticalDamage: number = 4,
    mwx: number = 0,
    apx: number = 0,
    px: number = 0,
    reroll: Ability = Ability.None,
    lethalx: number = 0,
    rending: boolean = false,
    starfire: boolean = false,
  ) {
    this.attacks = attacks;
    this.bs = bs;
    this.normalDamage = normalDamage;
    this.criticalDamage = criticalDamage;
    this.mwx = mwx;
    this.apx = apx;
    this.px = px;
    this.reroll = reroll;
    this.lethalx = lethalx;
    this.rending = rending;
    this.starfire = starfire;
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
    return this.lethalx === 0 ? 6 : this.lethalx;
  }

  public setProp(propName: keyof Attacker, value: number | Ability | boolean) : Attacker {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Attacker, value: number | Ability | boolean) : Attacker {
    const copy = _.clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public withAlwaysNormHit() : Attacker {
    return this.withProp('bs', 1).setProp('lethalx', 7);
  }

  public withAlwaysCritHit() : Attacker {
    return this.withProp('bs', 1).setProp('lethalx', 1);
  }
}