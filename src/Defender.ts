import Die from "./Die";

export default class Attacker {
  public save: number;
  public defense: number;
  public wounds: number;
  public fnp: number;
  public invulnSave: number;
  public useInvulnSave: boolean;
  public cover: boolean;
  public chitin: boolean;

  public constructor(
    save: number = 3,
    defense: number = 3,
    wounds: number = 12,
    fnp: number = 0,
    invulnSave: number = 0,
    useInvulnSave: boolean = false,
    cover: boolean = false,
    chitin: boolean = false,
  ) {
    this.save = save;
    this.defense = defense;
    this.wounds = wounds;
    this.fnp = fnp;
    this.invulnSave = invulnSave;
    this.useInvulnSave = useInvulnSave;
    this.cover = cover;
    this.chitin = chitin;
  }

  public usesInvulnSave(): boolean {
    return Die.Valid(this.invulnSave);
  }
}