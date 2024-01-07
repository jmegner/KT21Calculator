import { clone } from "lodash";
import Ability from "src/Ability";
import DieProbs from "src/DieProbs";
import * as Util from 'src/Util';
import NoCoverType from "src/NoCoverType";
import Die from "src/Die";

export default class Model {
  public wounds: number; // fight and shoot-def
  public numDice: number; // all
  public diceStat: number; // all, bs/ws/save
  public normDmg: number; // fight and shoot-attack
  public critDmg: number; // fight and shoot-attack
  public mwx: number; // shoot-attack only
  public apx: number; // shoot-attack only
  public px: number; // shoot-attack only
  public reroll: Ability; // all
  public lethal: number; // fight and shoot-attack; 0 means default of crit on 6+; can be 7 to force never-crit
  public hardyx: number; // shoot-defense, like Lethal
  public fnp: number; // fight and shoot-def; Feel No Pain: for each point of dmg, roll a die and on given number or better, avoid dmg
  public autoNorms: number; // all
  public autoCrits: number; // all
  public failsToNorms: number; // all
  public normsToCrits: number; // all
  public noCover: NoCoverType; // NOT IMPLEMENTED, for shoot-attack only
  public invulnSave: number; // shoot-def only
  public abilities: Set<Ability>; // all, for basically all bool abilities

  public constructor(
    numDice: number = 4,
    diceStat: number = 3,
    normDmg: number = 3,
    critDmg: number = 4,
    mwx: number = 0,
    abilities: Set<Ability> = new Set<Ability>(),
  ) {
    this.numDice = numDice;
    this.diceStat = diceStat;
    this.normDmg = normDmg;
    this.critDmg = critDmg;
    this.mwx = mwx;
    this.apx = 0;
    this.px = 0;
    this.reroll = Ability.None;
    this.lethal = 0;
    this.hardyx = 0;
    this.wounds = 12;
    this.fnp = 0;
    this.autoNorms = 0;
    this.autoCrits = 0;
    this.failsToNorms = 0;
    this.normsToCrits = 0;
    this.noCover = NoCoverType.No;
    this.invulnSave = 0;
    this.abilities = abilities;
  }

  public static basicDefender(
    defense: number = 3,
    save: number = 3,
    wounds: number = 12,
  ) : Model
  {
    const def = new Model();
    def.numDice = defense;
    def.diceStat = save;
    def.wounds = wounds;
    return def;
  }

  public static justDamage(
    normalDamage: number,
    criticalDamage: number = 0,
    mwx: number = 0
  ) : Model
  {
    return new Model(0, 0, normalDamage, criticalDamage, mwx);
  }

  public critSkill(): number {
    if(this.lethal > 0) {
      return this.lethal;
    }
    if(this.hardyx > 0) {
      return this.hardyx;
    }
    return 6;
  }

  //#ERROR TODO: look at all uses of possibleDmg to see if okay to not include hammerhand
  public possibleDmg(crits: number, norms: number): number {
    return crits * (this.critDmg + this.mwx) + norms * this.normDmg;
  }

  public cancelsPerParry(): number {
    return this.abilities.has(Ability.StormShield) ? 2 : 1;
  }

  public toAttackerDieProbs(): DieProbs {
    return DieProbs.fromSkills(this.critSkill(), this.diceStat, this.reroll);
  }

  public toDefenderDieProbs(): DieProbs {
    return DieProbs.fromSkills(this.critSkill(), this.relevantSave(), this.reroll);
  }

  public setProp(propName: keyof Model, value: number | Ability | boolean | Set<Ability>) : Model {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Model, value: number | Ability | boolean | Set<Ability>) : Model {
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

  public setAbility(ability: Ability, addIt: boolean): Model {
    Util.addOrRemove(this.abilities, ability, addIt);
    return this;
  }

  public withAlwaysNorm() : Model {
    return this.withProp('diceStat', 1).setProp('lethal', 7);
  }

  public withAlwaysCrit() : Model {
    return this.withProp('diceStat', 1).setProp('lethal', 1);
  }

  public usesFnp(): boolean {
    return Die.Valid(this.fnp);
  }

  public usesInvulnSave(): boolean {
    return Die.Valid(this.invulnSave);
  }

  public relevantSave(): number {
    return this.usesInvulnSave() ? this.invulnSave : this.diceStat;
  }

}