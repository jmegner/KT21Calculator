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
  public lethalx: number;
  public rending: boolean; // a crit promotes a normal hit to a crit
  public starfire: boolean; // a crit promotes a fail to a normal hit

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
}