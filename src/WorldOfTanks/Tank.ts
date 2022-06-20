import Reroll from "src/WorldOfTanks/Reroll";

export class Tank {
  public dice: number;
  public reroll: Reroll;
  public hp: number;
  public arrowShot: boolean;
  public bigGun: boolean;
  public deadeye: boolean;
  public highExplosive: boolean;
  public targetIsHullDown: boolean;

  public constructor(
    dice: number = 4,
    reroll: Reroll = Reroll.None,
    hp: number = 4,
    arrowShot: boolean = false,
    bigGun: boolean = false,
    deadeye: boolean = false,
    highExplosive: boolean = false,
    targetIsHullDown: boolean = false,
  ) {
    this.dice = dice;
    this.reroll = reroll;
    this.hp = hp;
    this.arrowShot = arrowShot;
    this.bigGun = bigGun;
    this.deadeye = deadeye;
    this.highExplosive = highExplosive;
    this.targetIsHullDown = targetIsHullDown;
  }
}

export default Tank;