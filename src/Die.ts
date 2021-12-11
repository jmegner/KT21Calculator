import _ from 'lodash';

export default class Die {
  static readonly PipMin = 1; 
  static readonly PipMax = 6; 

  static PipsUp(): number[] {
    return _.range(Die.PipMin, Die.PipMax + 1);
  }

  static PipsDown(): number[] {
    return _.rangeRight(Die.PipMin, Die.PipMax + 1);
  }

  static Valid(pip: number): boolean {
    return pip >= Die.PipMin && pip <= Die.PipMax;
  }
}