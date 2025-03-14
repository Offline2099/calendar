import { Signal } from '@angular/core';
import { TimePeriodLong as SectionId } from '../constants/time-period';

export interface YearPickerSection {
  id: SectionId;
  name: {
    normalState: string;
    minimizedState: string;
  },
  isCollapsed: boolean;
  caption: Signal<string>;
  rows: Signal<YearPickerButtonRow[]>;
}

export interface YearPickerButtonRow {
  id: number;
  name: string;
  isCollapsed: boolean;
  buttons: YearPickerButton[];
}

export interface YearPickerButton {
  id: number;
  text: string;
  bg: string;
}
