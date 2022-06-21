import Reroll from "src/WorldOfTanks/Reroll";

export class Tank {
  public dice: number;
  public reroll: Reroll;
  public hp: number;
  public hitsToCrits: number;
  public critsToHits: number;
  public deadeye: boolean;
  public highExplosive: boolean;
  public targetIsHullDown: boolean;

  public constructor(
    dice: number = 4,
    reroll: Reroll = Reroll.None,
    hp: number = 4,
    hitsToCrits: number = 0,
    critsToHits: number = 0,
    deadeye: boolean = false,
    highExplosive: boolean = false,
    targetIsHullDown: boolean = false,
  ) {
    this.dice = dice;
    this.reroll = reroll;
    this.hp = hp;
    this.hitsToCrits = hitsToCrits;
    this.critsToHits = critsToHits;
    this.deadeye = deadeye;
    this.highExplosive = highExplosive;
    this.targetIsHullDown = targetIsHullDown;
  }
}

export default Tank;