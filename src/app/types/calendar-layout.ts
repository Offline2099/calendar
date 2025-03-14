export type CalendarColumnCount = 0 | 1 | 2 | 3;

export interface MonthState {
  isCollapsed: boolean;
  hasExtraMargin: boolean;
  weekLines: number;
}

export type CalendarGridState = Record<CalendarColumnCount, (MonthState | null)[]>;
