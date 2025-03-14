import { Injectable, signal, computed } from '@angular/core';
import * as C from '../constants/calendar';
import { CALENDAR_LIMITS_PANEL, PanelRowId } from '../constants/limits-panel';
import { LimitsExtention } from '../types/limits-extention.interface';
import { SettingsPanelRow } from '../types/limits-panel';
import { CalendarService } from './calendar.service';
import { UtilityService } from './utility.service';

interface Range {
  min: number;
  max: number;
}

const DEFAULT_MIN_YEAR: number = -4999;
const DEFAULT_MAX_YEAR: number = 4999;

const EXTENTION_STEP: number = 5000;
const MAX_EXTENTION_STEPS: number = 3;

@Injectable({
  providedIn: 'root'
})
export class LimitService {
 
  private startExt = signal<number>(0);
  private endExt = signal<number>(0);

  year = computed<Range>(() => ({
    min: DEFAULT_MIN_YEAR - EXTENTION_STEP * this.startExt(),
    max: DEFAULT_MAX_YEAR + EXTENTION_STEP * this.endExt()
  }));

  century = computed<Range>(() => ({
    min: this.calendar.getCenturyFromYear(this.year().min),
    max: this.calendar.getCenturyFromYear(this.year().max)
  }));

  millennium = computed<Range>(() => ({
    min: this.calendar.getMillenniumFromYear(this.year().min),
    max: this.calendar.getMillenniumFromYear(this.year().max)
  }));

  extension = computed<LimitsExtention>(() => ({
    start: this.startExt(),
    end: this.endExt()
  }));

  constructor(private calendar: CalendarService, private utility: UtilityService) {}

  constructLimitsPanel(): SettingsPanelRow[] {
    return CALENDAR_LIMITS_PANEL.map(row => ({
      ...row,
      options: this.limitsPanelRowOptions(row.id),
      selectedIndex: computed(() => this.limitsPanelRowSelectedIndex(row.id, this.millennium()))
    }));
  }

  limitsPanelRowOptions(id: PanelRowId): string[] {
    const rowLength: number = 1 + MAX_EXTENTION_STEPS;
    const step: number = EXTENTION_STEP / C.YEARS_IN_MILLENNIUM;
    let start: number, end: number;
    switch (id) {
      case PanelRowId.calendarStart:
        start = -rowLength * step;
        end = -step;
        break;
      case PanelRowId.calendarEnd:
        start = step;
        end = rowLength * step;
        break;
    }
    return this.utility.sequence(start, end, step).map(millennium =>
      this.calendar.millenniumName(millennium)
    );
  }

  limitsPanelRowSelectedIndex(id: PanelRowId, millennium: Range): number {
    switch (id) {
      case PanelRowId.calendarStart:
        return MAX_EXTENTION_STEPS + C.YEARS_IN_MILLENNIUM * millennium.min / EXTENTION_STEP + 1;
      case PanelRowId.calendarEnd:
        return C.YEARS_IN_MILLENNIUM * millennium.max / EXTENTION_STEP - 1;
    }
  }

  setCalendarLimits(id: PanelRowId, index: number): void {
    switch (id) {
      case PanelRowId.calendarStart:
        this.startExt.set(MAX_EXTENTION_STEPS - index);
        break;
      case PanelRowId.calendarEnd:
        this.endExt.set(index);
        break;
    }
  }

  setDefaultCalendarLimits(): void {
    this.startExt.set(0);
    this.endExt.set(0);
  }

}
