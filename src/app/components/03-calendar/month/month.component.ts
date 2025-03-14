import { Component, input, signal, computed, output } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { DAYS_IN_WEEK } from '../../../constants/calendar';
import { WeekdayNumber } from '../../../types/weekday';
import { TimePeriodShort } from '../../../constants/time-period';
import { CalendarService } from '../../../services/calendar.service';
import { ColorService } from '../../../services/color.service';
import { UtilityService } from '../../../services/utility.service';

interface DateDifferenceLine {
  value: string;
  tail: string;
  isDisplayed: boolean;
}

@Component({
  selector: 'app-month',
  imports: [NgClass, NgStyle],
  templateUrl: './month.component.html',
  styleUrl: './month.component.scss'
})
export class MonthComponent {

  year = input.required<number>();
  month = input.required<number>();
  firstWeekday = input.required<WeekdayNumber>();

  toggle = output<void>();

  yearName = computed<string>(() => this.calendar.yearName(this.year()));
  yearColor = computed<string>(() => this.color.yearColor(this.year()));

  monthName = computed<string>(() => this.calendar.monthName(this.month()));
  monthNumberText = computed<string>(() => this.utility.addLeadingZeroes(this.month() + 1));

  weekdayNames = computed<string[]>(() => this.calendar.weekdayNames(this.firstWeekday(), true));
  weekdayHovered: WeekdayNumber | null = null;

  monthGrid = computed<number[]>(() => 
    this.calendar.monthGrid(this.year(), this.month(), this.firstWeekday())
  );

  dayHovered = signal<number | null>(null);
  difference = computed<DateDifferenceLine[] | null>(() => 
    this.constructTooltipLines(this.year(), this.month(), this.dayHovered())
  );

  DAYS_IN_WEEK = DAYS_IN_WEEK;

  constructor(
    private calendar: CalendarService,
    private color: ColorService,
    private utility: UtilityService
  ) {}

  toggleMonth(): void {
    this.toggle.emit();
  }

  setHoveredWeekday(n: number | null): void {
    this.weekdayHovered = n as WeekdayNumber;
  }

  setHoveredDay(day: number | null): void {
    this.dayHovered.set(day);
  }

  constructTooltipLines(year: number, month: number, day: number | null): DateDifferenceLine[] | null {
    if (!day) return null;
    const difference: Record<TimePeriodShort, number> = 
      this.calendar.differenceFromToday(this.calendar.constructDate(year, month, day));
    const differenceInYears: number = Math.abs(difference[TimePeriodShort.year]);
    return Object.entries(difference).map(([period, difference]) => {
      const value: string = !difference && period === TimePeriodShort.day 
        ? 'Today'
        : this.utility.formatNumber(Math.abs(difference));
      const tail: string = this.constructTail(difference, period);
      return {
        value,
        tail,
        isDisplayed: (value !== '0' || tail !== '') &&
          !(period === TimePeriodShort.month && differenceInYears > 1) &&
          !(period === TimePeriodShort.week && differenceInYears > 0)
      }
    });
  }

  constructTail(value: number, unit: string): string {
    if (!value) return '';
    return ` ${unit}${Math.abs(value) > 1 ? 's' : ''} ${value > 0 ? 'ago' : 'in the future'}`;
  }

}
