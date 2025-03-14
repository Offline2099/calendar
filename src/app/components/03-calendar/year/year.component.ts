import { Component, model, signal, linkedSignal, computed, effect } from '@angular/core';
import { NgClass, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { Observable, map } from 'rxjs';
import { WeekdayNumber } from '../../../types/weekday';
import { CalendarColumnCount, CalendarGridState } from '../../../types/calendar-layout';
import { TwoWayButtonsComponent } from '../../06-ui-elements/two-way-buttons/two-way-buttons.component';
import { SelectionPanelComponent } from '../../06-ui-elements/selection-panel/selection-panel.component';
import { MonthComponent } from '../month/month.component';
import { CalendarService } from '../../../services/calendar.service';
import { LimitService } from '../../../services/limit.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-year',
  imports: [
    NgClass, NgTemplateOutlet, AsyncPipe,
    TwoWayButtonsComponent, SelectionPanelComponent, MonthComponent
  ],
  templateUrl: './year.component.html',
  styleUrl: './year.component.scss'
})
export class YearComponent {

  year = model.required<number>();
  firstWeekday = signal<WeekdayNumber>(1);

  yearName = computed<string>(() => this.calendar.yearName(this.year()));
  isMinYear = computed<boolean>(() => this.year() <= this.limits.year().min);
  isMaxYear = computed<boolean>(() => this.year() >= this.limits.year().max);
  
  headerFadeInState: boolean = false;
  gridFadeInState: boolean = false;

  isSettingsPanelShown: boolean = false;
  weekdays$: Observable<string[]>;

  columnCount$: Observable<CalendarColumnCount>;
  previousGridState: CalendarGridState | null = null;
  gridState = linkedSignal<CalendarGridState>(() => 
    this.layout.setGridState(this.year(), this.firstWeekday(), this.previousGridState)
  );

  constructor(
    private calendar: CalendarService,
    private limits: LimitService,
    private layout: LayoutService   
  ) {
    this.weekdays$ = this.layout.isWide$.pipe(
      map(isWideScreen => this.getWeekdayNames(isWideScreen))
    );
    this.columnCount$ = this.layout.calendarColumnCount$;
    effect(() => {
      if (this.year()) { 
        this.blinkHeader();
        this.blinkGrid();
      }
    });
    effect(() => {
      if (this.firstWeekday() !== null) this.blinkGrid();
    });
  }

  blinkHeader(): void {
    this.headerFadeInState = !this.headerFadeInState;
  }

  blinkGrid(): void {
    this.gridFadeInState = !this.gridFadeInState;
  }

  shiftYear(shift: -1 | 1): void {
    this.previousGridState = this.gridState();
    this.year.update(year => year + shift);
  }

  toggleSettingsPanel(): void {
    this.isSettingsPanelShown = !this.isSettingsPanelShown;
  }

  getWeekdayNames(isWideScreen: boolean): string[] {
    return this.calendar.weekdaysAll().map(weekday => 
      isWideScreen ? weekday.nameFull : weekday.nameShort 
    );
  }

  setFirstWeekday(number: number): void {
    this.previousGridState = this.gridState();
    this.firstWeekday.set(number as WeekdayNumber);
  }

  toggleMonth(columnCount: CalendarColumnCount, month: number): void {
    this.gridState.update(state => this.layout.toggleMonth(state, columnCount, month));
  }

}
