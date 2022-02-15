import { range, rangeRight} from 'lodash';

export default class Die {
  static readonly PipMin = 1; 
  static readonly PipMax = 6; 

  static PipsUp(): number[] {
    return range(Die.PipMin, Die.PipMax + 1);
  }

  static PipsDown(): number[] {
    return rangeRight(Die.PipMin, Die.PipMax + 1);
  }

  static Valid(pip: number): boolean {
    return pip >= Die.PipMin && pip <= Die.PipMax;
  }
}