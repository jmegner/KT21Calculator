import { clone } from "lodash";
import Die from "src/Die";
import DieProbs from "src/DieProbs";

export default class Defender {
  public defense: number;
  public save: number;
  public wounds: number;
  public fnp: number;
  public invulnSave: number;
  public coverSaves: number;
  public chitin: boolean;

  public constructor(
    defense: number = 3,
    save: number = 3,
    wounds: number = 12,
    fnp: number = 0,
    invulnSave: number = 0,
    coverSaves: number = 0,
    chitin: boolean = false,
  ) {
    this.defense = defense;
    this.save = save;
    this.wounds = wounds;
    this.fnp = fnp;
    this.invulnSave = invulnSave;
    this.coverSaves = coverSaves;
    this.chitin = chitin;
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

  public toDieProbs(): DieProbs {
    const critSaveProb = 1 / 6;
    const normSaveProb = (6 - this.relevantSave()) / 6;
    const failSaveProb = (this.relevantSave() - 1) / 6;
    return new DieProbs(
      critSaveProb,
      normSaveProb,
      failSaveProb,
    );
  }

  public setProp(propName: keyof Defender, value: number | boolean) : Defender {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Defender, value: number | boolean) : Defender {
    const copy = clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public withAlwaysNonfail(): Defender {
    return this.withProp('save', 1);
  }
}