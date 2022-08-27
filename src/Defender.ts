import { clone } from "lodash";
import Die from "src/Die";
import DieProbs from "src/DieProbs";

export default class Defender {
  public defense: number;
  public save: number;
  public wounds: number;
  public fnp: number;
  public invulnSave: number;
  public coverNormSaves: number;
  public coverCritSaves: number;
  public chitin: boolean;
  public hardyx: number; // like LethalX, but for defense

  public constructor(
    defense: number = 3,
    save: number = 3,
    wounds: number = 12,
    fnp: number = 0,
    invulnSave: number = 0,
    coverNormSaves: number = 0,
    coverCritSaves: number = 0,
    chitin: boolean = false,
    hardyx: number = 0,
  ) {
    this.defense = defense;
    this.save = save;
    this.wounds = wounds;
    this.fnp = fnp;
    this.invulnSave = invulnSave;
    this.coverNormSaves = coverNormSaves;
    this.coverCritSaves = coverCritSaves;
    this.chitin = chitin;
    this.hardyx = hardyx;
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
    const critSkill = this.critSkill();
    const critSaveProb = (7 - critSkill) / 6;
    const normSaveProb = Math.max(0, (critSkill - this.relevantSave()) / 6); // handle Sv=6+ and HardyX=5+
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