import { clone } from "lodash";

export default class Model {
  public hp: number;
  public numDice: number;
  public diceStat: number;
  public numRerolls: number;
  public ap: number;
  public armor: number;
  public numShieldDice: number;
  public toxicDmg: number; // additional dmg if any dmg goes through; "Dismantle" is basically toxic 1 against vehicles

  public constructor(
    hp: number = 2,
    numDice: number = 3,
    diceStat: number = 5,
    numRerolls: number = 0,
    ap: number = 0,
    armor: number = 0,
    numShieldDice: number = 0,
    toxicDmg: number = 0,
  ) {
    this.hp = hp;
    this.numDice = numDice;
    this.diceStat = diceStat;
    this.numRerolls = numRerolls;
    this.ap = ap;
    this.armor = armor;
    this.numShieldDice = numShieldDice;
    this.toxicDmg = toxicDmg;
  }

  public setProp(propName: keyof Model, value: number) : Model {
    (this[propName] as any) = value;
    return this;
  }

  public withProp(propName: keyof Model, value: number) : Model {
    const copy = clone(this);
    copy.setProp(propName, value);
    return copy;
  }

  public successProb(): number {
    return (9.0 - this.diceStat) / 8.0;
  }

}