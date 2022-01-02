import _ from "lodash";
import Die from "./Die";

export default class Defender {
  public defense: number;
  public save: number;
  public wounds: number;
  public fnp: number;
  public invulnSave: number;
  public cover: boolean;
  public chitin: boolean;

  public constructor(
    defense: number = 3,
    save: number = 3,
    wounds: number = 12,
    fnp: number = 0,
    invulnSave: number = 0,
    cover: boolean = false,
    chitin: boolean = false,
  ) {
    this.defense = defense;
    this.save = save;
    this.wounds = wounds;
    this.fnp = fnp;
    this.invulnSave = invulnSave;
    this.cover = cover;
    this.chitin = chitin;
  }

  public usesInvulnSave(): boolean {
    return Die.Valid(this.invulnSave);
  }

  public relevantSave(): number {
    return this.usesInvulnSave() ? this.invulnSave : this.save;
  }

  public setProp(propName: keyof Defender, value: number | boolean) : Defender {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Defender, value: number | boolean) : Defender {
    const copy = _.clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public withAlwaysNonfail(): Defender {
    return this.withProp('save', 1);
  }
}