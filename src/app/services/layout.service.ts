import { Injectable, Signal, computed } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
// Constants & Enums
import * as C from '../constants/calendar';
import { BREAKPOINTS, ScreenWidthCategory, ScreenWidthStatus } from '../constants/screen-width';
// Interfaces & Types
import { WeekdayNumber } from '../types/weekday';
import { CalendarColumnCount, CalendarGridState, MonthState } from '../types/calendar-layout';
// Services
import { CalendarService } from './calendar.service';

interface GridStateParams {
  year: number;
  firstWeekday: WeekdayNumber;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  
  width: Signal<ScreenWidthStatus>;
  category: Signal<ScreenWidthCategory>;

  calendarColumnCount: Signal<CalendarColumnCount>;

  constructor(private observer: BreakpointObserver, private calendar: CalendarService) {
    const status$: Observable<ScreenWidthStatus> = 
      this.observer.observe(Object.values(BREAKPOINTS)).pipe(
        map(breakpointState => this.getScreenWidthStatus(breakpointState))
      );
    this.width = toSignal(status$, { requireSync: true });
    this.category = computed<ScreenWidthCategory>(() => 
      this.getScreenWidthCategory(this.width())
    );
    this.calendarColumnCount = computed<CalendarColumnCount>(() => 
      this.getCalendarColumnCount(this.width())
    );
  }

  private getScreenWidthStatus(breakpointState: BreakpointState): ScreenWidthStatus {
    return Number(
      Object.entries(BREAKPOINTS).find(([_, value]) => breakpointState.breakpoints[value])![0]
    ) as ScreenWidthStatus;
  }

  private getScreenWidthCategory(status: ScreenWidthStatus): ScreenWidthCategory {
    switch (status) {
      case ScreenWidthStatus.under600px:
        return ScreenWidthCategory.mobile;
      case ScreenWidthStatus.between600and900px:
        return ScreenWidthCategory.tablet;
      default:
        return ScreenWidthCategory.desktop;
    }
  }

  private getCalendarColumnCount(status: ScreenWidthStatus): CalendarColumnCount {
    switch (status) {
      case ScreenWidthStatus.under600px:
        return 1;
      case ScreenWidthStatus.between600and900px:
        return 2;
      case ScreenWidthStatus.between900and1200px:
        return 3;
      default:
        return 0;
    }
  }

  private setMonthStates(params: GridStateParams, isCollapsed: boolean[]): MonthState[] {
    return isCollapsed.map((isCollapsed, index) => ({
      isCollapsed,
      hasExtraMargin: false,
      weekLines: this.calendar.monthGridWeekLines(params.year, index, params.firstWeekday)
    }));
  }

  private previousOrDefault(
    previous: CalendarGridState | null,
    columnCount: CalendarColumnCount,
    defaultState: boolean
  ): boolean[] {
    return previous 
      ? (previous[columnCount] as MonthState[]).map(month => month.isCollapsed)
      : Array(C.MONTHS_IN_YEAR).fill(defaultState);
  }

  private updateMargins(gridState: CalendarGridState, columnCount?: CalendarColumnCount): void {
    if (columnCount === undefined) {
      this.updateMargins(gridState, 2);
      this.updateMargins(gridState, 3);
      return;
    }
    if (columnCount === 1) return;
    const monthStates: MonthState[] = gridState[columnCount] as MonthState[];
    for (let i = 0; i < monthStates.length; i++) {
      monthStates[i].hasExtraMargin = false;
      if (monthStates[i].isCollapsed) continue;
      for (let j = 0; j < i; j++) {
        if (
          monthStates[j].isCollapsed ||
          this.monthLevel(monthStates, columnCount, i) !== this.monthLevel(monthStates, columnCount, j)
        ) continue;
        if (monthStates[i].weekLines < monthStates[j].weekLines)
          monthStates[i].hasExtraMargin = true;
        else if (monthStates[j].weekLines < monthStates[i].weekLines)
          monthStates[j].hasExtraMargin = true;
      }
    }
  }

  private monthLevel(monthStates: MonthState[], columnCount: number, month: number): number {
    return monthStates.reduce((acc, el, index) => {
      return index < month && this.inSameColumn(columnCount, index, month)
        ? acc + this.monthHeight(el)
        : acc;
    }, 0);
  }

  private inSameColumn(columnCount: number, month1: number, month2: number): boolean {
    return month1 % columnCount === month2 % columnCount;
  }

  private monthHeight(monthState: MonthState): number {
    const weekLines: number = monthState.isCollapsed ? 1 : monthState.weekLines + 2;
    const extraLine: number = monthState.hasExtraMargin ? 1 : 0;
    return weekLines + extraLine;
  }

  setGridState(
    year: number,
    firstWeekday: WeekdayNumber,
    previous: CalendarGridState | null = null
  ): CalendarGridState {
    const params: GridStateParams = { year, firstWeekday }
    const gridState: CalendarGridState = {
      0: Array(C.MONTHS_IN_YEAR).fill(null),
      1: this.setMonthStates(params, this.previousOrDefault(previous, 1, true)),
      2: this.setMonthStates(params, this.previousOrDefault(previous, 2, true)),
      3: this.setMonthStates(params, this.previousOrDefault(previous, 3, false))
    }
    this.updateMargins(gridState);
    return gridState;
  }

  toggleMonth(
    gridState: CalendarGridState,
    columnCount: CalendarColumnCount,
    month: number
  ): CalendarGridState {
    if (!gridState[columnCount][month]) return gridState;
    const monthState: MonthState = gridState[columnCount][month];
    monthState.isCollapsed = !monthState.isCollapsed;
    this.updateMargins(gridState, columnCount);
    return gridState;
  }

}