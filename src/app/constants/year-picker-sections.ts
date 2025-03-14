import { TimePeriodLong as SectionId } from '../constants/time-period';
import { YearPickerSection } from '../types/year-picker-sections';

export const SECTIONS: Pick<YearPickerSection, 'id' | 'name'>[] = [
  {
    id: SectionId.millennium,
    name: {
      normalState: 'Millennia',
      minimizedState: 'Millennium'
    }
  },
  {
    id: SectionId.century,
    name: {
      normalState: 'Centuries',
      minimizedState: 'Century'
    }
  },
  {
    id: SectionId.year,
    name: {
      normalState: 'Years',
      minimizedState: 'Year'
    }
  }
];
