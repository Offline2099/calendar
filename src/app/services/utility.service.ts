import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  /** 
   * Creates an array of numbers from ```start``` to ```end``` (both included) with the given ```step```.
   *  - Returns an empty array if ```step``` is invalid.
   *  - If ```step``` is omitted, it is set to 1.
   */
  sequence(start: number, end: number, step: number = 1): number[] {
    if (!step || ((step > 0 && start > end) || (step < 0 && start < end))) return [];
    const length: number = Math.floor(Math.abs((end - start) / step) + 1);
    return Array.from({ length }, (_, index) => start + index * step);
  }

  /**
   * Converts a ```number``` to a ```string``` with leading zeroes added.
   * @param number Number to convert. Rounds to an integer.
   * @param digits The number of digits in the result. Two if omitted. 
   *  Ignored if smaller than the original length of the number.
   */
  addLeadingZeroes(number: number, digits: number = 2): string {
    let str: string = `${Math.abs(Math.round(number))}`;
    while (str.length < digits) str = `0${str}`;
    return `${number < 0 ? '-' : ''}${str}`;
  }

  /** Adds the correct ordinal suffix ('st', 'nd', 'rd', or 'th') to a given number. */
  addNumberSuffix(n: number): string {
    let suffix: string;
    const nStr: string = Math.round(Math.abs(n)).toString();
    const lastChar: string = nStr.charAt(nStr.length - 1);
    const secondLastChar: string = nStr.length > 1 ? nStr.charAt(nStr.length - 2) : '';
    if (lastChar === '1' && secondLastChar !== '1')
      suffix = 'st';
    else if (lastChar === '2' && secondLastChar !== '1')
      suffix = 'nd';
    else if (lastChar === '3' && secondLastChar !== '1')
      suffix = 'rd';
    else suffix = 'th';
    return nStr + suffix;
  }

  /** Returns a string representing the given number with thin spaces inserted every 3 decimal places. */
  formatNumber(n: number): string {
    const str: string = Math.abs(n).toString();
    let parts: string[] = [];
    for (let i = str.length - 1; i >= 0; i--) {
      parts.unshift(str[i]);
      if (i && (i != str.length - 1) && !((str.length - i) % 3)) parts.unshift('\u2009');
    }
    return (n < 0 ? '-' : '') + parts.join('');
  }

}