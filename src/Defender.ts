import { clone } from "lodash";
import Die from "src/Die";
import DieProbs from "src/DieProbs";
import Ability from "./Ability";
import * as Util from 'src/Util';

export default class Defender {
  public defense: number;
  public save: number;
  public wounds: number;
  public fnp: number;
  public invulnSave: number;
  public coverNormSaves: number;
  public coverCritSaves: number;
  public reroll: Ability;
  public hardyx: number; // like Lethal, but for defense
  public normsToCrits: number;
  public abilities: Set<Ability>; // for basically all bool abilities

  public constructor(
    defense: number = 3,
    save: number = 3,
    wounds: number = 12,
  ) {
    this.defense = defense;
    this.save = save;
    this.wounds = wounds;
    this.fnp = 0;
    this.invulnSave = 0;
    this.coverNormSaves = 0;
    this.coverCritSaves = 0;
    this.reroll = Ability.None;
    this.hardyx = 0;
    this.normsToCrits = 0;
    this.abilities = new Set<Ability>();
  }

  public usesFnp(): boolean {
    return Die.Valid(this.fnp);
  }

  public usesInvulnSave(): boolean {
    return Die.Valid(this.invulnSave);
  }

  public relevantSave(): number {
    return this.usesInvulnSave() ? this.invulnSave : this.save;
  }

  public critSkill(): number {
    return this.hardyx === 0 ? 6 : this.hardyx;
  }

  public toDieProbs(): DieProbs {
    return DieProbs.fromSkills(this.critSkill(), this.relevantSave(), this.reroll);
  }

  public setProp(propName: keyof Defender, value: number | boolean | Ability) : Defender {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Defender, value: number | boolean | Ability) : Defender {
    const copy = clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public withAlwaysNonfail(): Defender {
    return this.withProp('save', 1);
  }

  public has(ability: Ability): boolean {
    if(this.reroll === ability) {
      return true;
    }
    return this.abilities.has(ability);
  }

  public setAbility(ability: Ability, addIt: boolean): Defender {
    Util.addOrRemove(this.abilities, ability, addIt);
    return this;
  }

}