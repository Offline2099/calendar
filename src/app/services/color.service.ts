import { Injectable } from '@angular/core';
import * as C from '../constants/calendar';
import { TimePeriodLong as PeriodType } from '../constants/time-period';
import { CalendarService } from './calendar.service';

const HUE_MILLENNIA_BC: number[] = [
  40, 34, 26, 18, 10,
  0, -10, -20, -25, -30,
  -30, -32, -34, -36, -38,
  -41, -42, -43, -44, -45
];

const HUE_MILLENNIA_CE: number[] = [
  50, 70, 130, 160, 180,
  184, 188, 192, 196, 200,
  204, 208, 212, 216, 220,
  224, 228, 232, 236, 240
];

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor(private calendar: CalendarService) {}

  private getPeriodHue(type: Exclude<PeriodType, PeriodType.millennium>, id: number): number {
    let millenium: number;
    let periods: number;
    let hue: number, nextHue: number;
    switch (type) {
      case PeriodType.century:
        millenium = this.calendar.getMillenniumFromCentury(id);
        periods = C.CENTURIES_IN_MILLENNIUM;
        break;
      case PeriodType.year:
        millenium = this.calendar.getMillenniumFromYear(id);
        periods = C.YEARS_IN_MILLENNIUM;
        break;
    }
    hue = this.getMillenniumHue(millenium);
    nextHue = this.getMillenniumHue(id > 0 ? millenium + 1 : millenium - 1);
    return hue + (Math.abs(id) - periods * (Math.abs(millenium) - 1)) * (nextHue - hue) / periods;
  }

  getMillenniumHue(id: number): number {
    const BC: number[] = HUE_MILLENNIA_BC;
    const CE: number[] = HUE_MILLENNIA_CE;
    if (id < 0) {
      if (id < -BC.length) return BC[BC.length - 1];
      else return BC[-id - 1];
    }
    else if (id > 0) {
      if (id > CE.length) return CE[CE.length - 1];
      else return CE[id - 1];
    }
    return 0;
  }

  getCenturyHue(id: number): number {
    return this.getPeriodHue(PeriodType.century, id);
  }

  getYearHue(id: number): number {
    return this.getPeriodHue(PeriodType.year, id);
  }

  yearColor(year: number): string {
    return `hsl(${this.getYearHue(year)}, 18%, 60%)`;
  }

  yearBackground(year: number): string {
    const hue: number = this.getYearHue(year);
    const color: string = `hsla(${hue}, 35%, ${hue > 200 ? 8 + (hue - 200) / 6 : 8}%, .8)`;
    const texture: string = `url('./backgrounds/texture-2.webp')`;
    return `radial-gradient(circle at 50% 50%, rgba(18, 18, 18, .9), ${color}), ${texture}`;
  }

  pickerButtonBackground(period: PeriodType, id: number): string {
    let hue: number;
    switch (period) {
      case PeriodType.millennium:
        hue = this.getMillenniumHue(id);
        break;
      case PeriodType.century:
        hue = this.getCenturyHue(id);
        break;
      case PeriodType.year:
        hue = this.getYearHue(id);
        break;
    }
    const color: string = `hsl(${hue}, 35%, ${hue > 200 ? 18 + (hue - 200) / 6 : 18}%)`;
    return `radial-gradient(#242424, ${color})`;
  }

}
