import { Injectable } from '@angular/core';
import * as C from '../constants/calendar';
import { Weekday, WeekdayNumber } from '../types/weekday';
import { TimePeriodLong, TimePeriodShort } from '../constants/time-period';
import { UtilityService } from './utility.service';

interface SimpleDate {
  day: number;
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private utility: UtilityService) {}

  private readonly MONTH_NAMES: string[] = this.getMonthNames();
  private readonly WEEKDAYS: Weekday[] = this.getWeekdays();

  private getMonthNames(): string[] {
    return Array.from({ length: C.MONTHS_IN_YEAR }, (_, i) => 
      new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(0, i))
    );
  }

  private getWeekdays(): Weekday[] {
    return Array.from({ length: C.DAYS_IN_WEEK }, (_, i) => {
      const name: string = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(0, 0, i))
      return {
        number: i as WeekdayNumber,
        nameFull: name,
        nameShort: name.slice(0, 2)
      }
    });
  }

  weekdaysAll(): Weekday[] {
    return this.WEEKDAYS;
  }

  weekdayNames(firstWeekday: WeekdayNumber, short?: boolean): string[] {
    return [...this.WEEKDAYS.slice(firstWeekday), ...this.WEEKDAYS.slice(0, firstWeekday)]
      .map(weekday => short ? weekday.nameShort : weekday.nameFull);
  }

  monthNames(): string[] {
    return this.MONTH_NAMES;
  }

  monthName(month: number): string {
    if (month < 0 || month >= C.MONTHS_IN_YEAR) return '';
    return this.MONTH_NAMES[month];
  }

  yearName(year: number): string {
    return year > 0
      ? year > 999 ? `${year}` : `${year} AD`
      : `${-year} BC`;
  }

  decadeName(century: number, decade: number): string {
    return century > 0
      ? (C.YEARS_IN_CENTURY * (century - 1) + C.YEARS_IN_DECADE * decade) + 's'
      : (-C.YEARS_IN_CENTURY * (century + 1) + C.YEARS_IN_DECADE * decade) + 's BC';
  }

  centuryName(id: number, wordy: boolean = false): string {
    return this.utility.addNumberSuffix(id) + 
      (wordy ? ' Century' : '') + (id < 0 ? ' BC' : wordy ? ' AD' : '');
  }

  millenniumName(id: number, wordy: boolean = false): string {
    return this.utility.addNumberSuffix(id) + 
      (wordy ? ' Millennium' : '') + (id < 0 ? ' BC' : ' AD');
  }

  timePeriodName(period: TimePeriodLong, id: number): string {
    switch (period) {
      case TimePeriodLong.millennium:
        return this.millenniumName(id);
      case TimePeriodLong.century:
        return this.centuryName(id);
      case TimePeriodLong.year:
        return this.yearName(id);
    }
  }

  daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getCenturyFromYear(year: number): number {
    return year > 0 
      ? Math.ceil((year + 1) / C.YEARS_IN_CENTURY)
      : Math.floor((year - 1) / C.YEARS_IN_CENTURY);
  }

  getMillenniumFromYear(year: number): number {
    return year > 0
      ? Math.ceil((year + 1) / C.YEARS_IN_MILLENNIUM)
      : Math.floor((year - 1) / C.YEARS_IN_MILLENNIUM);
  }

  getMillenniumFromCentury(century: number) {
    return century > 0
      ? Math.ceil(century / C.CENTURIES_IN_MILLENNIUM)
      : Math.floor(century / C.CENTURIES_IN_MILLENNIUM);
  }

  millenniumContainsCentury(millenium: number, century: number): boolean {
    return millenium === this.getMillenniumFromCentury(century);
  }

  centuryContainsYear(century: number, year: number): boolean {
    return century === this.getCenturyFromYear(year);
  }

  decadeContainsYear(century: number, decade: number, year: number): boolean {
    const firstYear: number = century > 0
      ? C.YEARS_IN_CENTURY * (century - 1) + C.YEARS_IN_DECADE * decade
      : C.YEARS_IN_CENTURY * (century + 1) - C.YEARS_IN_DECADE * (decade +1) + 2;
    return year >= firstYear && year < firstYear + C.YEARS_IN_DECADE;
  }

  constructDate(year: number, month: number, day: number = 1): Date {
    // JS has issues interpreting double-digit and single-digit years.
    // Dates with such years (0 to 99) must be constructed via a string.
    if (year < 0 || year > 99) {
      return new Date(year, month, day);
    }
    else {
      let strYear: string = this.utility.addLeadingZeroes(year, 4);
      let strMonth: string = this.utility.addLeadingZeroes(month + 1);
      let strDay: string = this.utility.addLeadingZeroes(day);
      return new Date(`${strYear}-${strMonth}-${strDay}`);
    }
  }

  monthGrid(year: number, month: number, firstWeekday: WeekdayNumber): number[] {
    const monthStart: Date = this.constructDate(year, month);
    const daysBeforeMonth: number = 
      (monthStart.getDay() - firstWeekday + C.DAYS_IN_WEEK) % C.DAYS_IN_WEEK;
    const daysInMonth: number = new Date(monthStart.getFullYear(), month + 1, 0).getDate();
    const daysAfterMonth: number =
      C.DAYS_IN_WEEK - ((daysBeforeMonth + daysInMonth) % C.DAYS_IN_WEEK || C.DAYS_IN_WEEK);
    return [
      ...Array(daysBeforeMonth).fill(0),
      ...[...Array(daysInMonth).keys()].map(i => i + 1),
      ...Array(daysAfterMonth).fill(0)
    ];
  }

  monthGridWeekLines(year: number, month: number, firstWeekday: WeekdayNumber): number {
    return this.monthGrid(year, month, firstWeekday).length / C.DAYS_IN_WEEK;
  }

  difference(date1: Date, date2: Date): Record<TimePeriodShort, number> {
    const msDifference: number = date2.getTime() - date1.getTime();
    const sign: -1 | 1 = date1 < date2 ?  1 : -1;
    const earlier: SimpleDate = this.simpleDate(sign > 0 ? date1 : date2);
    const later: SimpleDate = this.simpleDate(sign > 0 ? date2 : date1);
    return {
      [TimePeriodShort.year]: sign * this.differenceInYears(earlier, later),
      [TimePeriodShort.month]: sign * this.differenceInMonths(earlier, later),
      [TimePeriodShort.week]: sign > 0 
        ? Math.floor(msDifference / C.MS_IN_WEEK)
        : Math.ceil(msDifference / C.MS_IN_WEEK),
      [TimePeriodShort.day]: Math.floor(msDifference / C.MS_IN_DAY) 
    };
  }

  private simpleDate(date: Date): SimpleDate {
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
  }

  private differenceInMonths(earlier: SimpleDate, later: SimpleDate): number {
    return C.MONTHS_IN_YEAR * (later.year - earlier.year) + later.month - earlier.month
      + (earlier.day > later.day ? -1 : 0);
  }

  private differenceInYears(earlier: SimpleDate, later: SimpleDate): number {
    return later.year - earlier.year
      + (earlier.month > later.month ? -1 : 0)
      + (earlier.month === later.month ? (earlier.day > later.day ? -1 : 0) : 0);
  }

  differenceFromToday(date: Date): Record<TimePeriodShort, number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.difference(date, today);
  }

}