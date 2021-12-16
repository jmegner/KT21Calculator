import _ from 'lodash';

export default class Util {
  public static readonly thickX = '✖';
  public static readonly thickCheck = '✔';

  public static acceptNumToAcceptString(setter: (val: number) => void) : (text: string) => void {
    return function stringAccepter(text: string): void {
      const intAttempt = parseInt(text);
      setter(isNaN(intAttempt) ? 0 : intAttempt);
    }
  }

  public static acceptBoolToAcceptString(setter: (val: boolean) => void) : (text: string) => void {
    return function stringAccepter(text: string): void {
      setter(text === Util.thickCheck);
    }
  }

  public static boolToCheckX(val: boolean) : string {
    return val ? Util.thickCheck : Util.thickX;
  }

  public static span(min: number, max: number, suffix?: string) : string[] {
    return _.range(min, max + 1).map(x => x.toString() + (suffix ? suffix : ''));
  }

  public static xspan(min: number, max: number, suffix?: string) : string[] {
    return _.concat([Util.thickX], Util.span(min, max, suffix));
  }

  public static readonly rollSpan = Util.span(2, 6, '+');
  public static readonly xrollSpan = Util.preX(Util.rollSpan);

  public static preX(vals: string[]) : string[] {
    return _.concat([Util.thickX], vals);
  }

  public static readonly xAndCheck = [Util.thickX, Util.thickCheck];

  public static readonly centerHoriz = 'd-flex justify-content-center';
  public static readonly centerHorizVert = 'd-flex justify-content-center align-items-center';

}