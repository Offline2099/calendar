import { Component, HostListener, model } from '@angular/core';
import { CalendarService } from '../../services/calendar.service';

interface MonthData {
  monthNumber: number;
  monthName: string;
  daysInMonth: number;
  daysInMonthForLeapYear?: number;
}

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  @HostListener('click') onClick(): void { this.hideOverlay() }

  isOverlayShown = model.required<boolean>();
  table: MonthData[];

  constructor(private calendar: CalendarService) {
    this.table = this.constructTable();
  }

  constructTable(): MonthData[] {
    return this.calendar.monthNames().map((name, index) => {
      const days: number = this.calendar.daysInMonth(1, index);
      return {
        monthNumber: index + 1,
        monthName: name,
        daysInMonth: days,
        daysInMonthForLeapYear: index === 1 ? days + 1 : undefined
      }
    });
  }

  hideOverlay(): void {
    this.isOverlayShown.set(false);
  }

}
