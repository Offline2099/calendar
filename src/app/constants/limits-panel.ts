import { SettingsPanelRow } from '../types/limits-panel';

export enum PanelRowId {
  calendarStart,
  calendarEnd
}

export const CALENDAR_LIMITS_PANEL: Pick<SettingsPanelRow, 'id' | 'name'>[] = [
  { 
    id: PanelRowId.calendarStart,
    name: 'Earliest Millennium in Range'
  },
  {
    id: PanelRowId.calendarEnd,
    name: 'Last Millennium in Range'
  }
];
