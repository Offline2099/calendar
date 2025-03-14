import { Signal } from '@angular/core';
import { PanelRowId } from '../constants/limits-panel';

export interface SettingsPanelRow {
  id: PanelRowId;
  name: string;
  options: string[];
  selectedIndex: Signal<number>;
}
