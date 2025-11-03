import { Component, HostBinding, linkedSignal, model, computed, effect } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
// Constants & Enums
import { DECADES_IN_CENTURY } from '../../constants/calendar';
import { SECTIONS } from '../../constants/year-picker-sections';
import { TimePeriodLong as SectionId } from '../../constants/time-period';
import { ScreenWidthCategory, ScreenWidthStatus } from '../../constants/screen-width';
import { YearPickerSection, YearPickerButtonRow, YearPickerButton } from '../../types/year-picker-sections';
// Interfaces & Types
import { LimitsExtention } from '../../types/limits-extention.interface';
import { SettingsPanelRow } from '../../types/limits-panel';
// Components
import { TwoWayButtonsComponent } from '../06-ui-elements/two-way-buttons/two-way-buttons.component';
import { SelectionPanelComponent } from '../06-ui-elements/selection-panel/selection-panel.component';
// Services
import { CalendarService } from '../../services/calendar.service';
import { LimitService } from '../../services/limit.service';
import { ColorService } from '../../services/color.service';
import { LayoutService } from '../../services/layout.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-year-picker',
  imports: [NgClass, NgStyle, TwoWayButtonsComponent, SelectionPanelComponent],
  templateUrl: './year-picker.component.html',
  styleUrl: './year-picker.component.scss'
})
export class YearPickerComponent {

  @HostBinding('class.minimized') get isMinimized(): boolean { return !this.isPickerOpen() }

  year = model.required<number>();
  isPickerOpen = model.required<boolean>();

  century = linkedSignal<number>(() => this.calendar.getCenturyFromYear(this.year()));
  millennium = linkedSignal<number>(() => this.calendar.getMillenniumFromYear(this.year()));

  isMinYear = computed<boolean>(() => this.year() <= this.limits.year().min);
  isMaxYear = computed<boolean>(() => this.year() >= this.limits.year().max);
  isMinCentury = computed<boolean>(() => this.century() <= this.limits.century().min);
  isMaxCentury = computed<boolean>(() => this.century() >= this.limits.century().max);
  isMinMillennium = computed<boolean>(() => this.millennium() <= this.limits.millennium().min);
  isMaxMillennium = computed<boolean>(() => this.millennium() >= this.limits.millennium().max);

  isPickedYearOutOfCentury = computed<boolean>(() => 
    !this.calendar.centuryContainsYear(this.century(), this.year())
  );

  isPickedCenturyOutOfMillennium = computed<boolean>(() => 
    !this.calendar.millenniumContainsCentury(this.millennium(), this.century())
  );

  isSettingsPanelShown: boolean = false;
  settingsPanelRows: SettingsPanelRow[];

  Section = SectionId;
  sections: YearPickerSection[];

  centuriesFadeInState: boolean = false;
  yearsFadeInState: boolean = false;

  isDesktop = computed<boolean>(() => this.layout.category() === ScreenWidthCategory.desktop);
  isMobile = computed<boolean>(() => this.layout.category() === ScreenWidthCategory.desktop);
  isUltraWide = computed<boolean>(() => this.layout.width() === ScreenWidthStatus.over2500px);

  constructor(
    private calendar: CalendarService,
    private limits: LimitService,
    private color: ColorService,
    private layout: LayoutService,
    private utility: UtilityService
  ) {
    this.sections = this.constructSections();
    this.settingsPanelRows = this.limits.constructLimitsPanel();
    effect(() => {
      if (!this.isDesktop()) this.limits.setDefaultCalendarLimits();
    });
    effect(() => {
      if (this.isPickerOpen()) return;
      this.resetUnfinishedPick();
      this.preventYearOutOfLimits();
    });
    effect(() => {
      if (this.millennium()) this.blinkCenturies();
    });
    effect(() => {
      if (this.century()) this.blinkYears();
    });
  }

  blinkCenturies(): void {
    this.centuriesFadeInState = !this.centuriesFadeInState;
  }

  blinkYears(): void {
    this.yearsFadeInState = !this.yearsFadeInState;
  }

  togglePicker(): void {
    this.isPickerOpen.update(value => !value);
  }

  resetUnfinishedPick(): void {
    if (this.isPickedYearOutOfCentury())
      this.century.set(this.calendar.getCenturyFromYear(this.year()));
    if (this.isPickedCenturyOutOfMillennium())
      this.millennium.set(this.calendar.getMillenniumFromYear(this.year()));
  }

  preventYearOutOfLimits(): void {
    if (this.year() < this.limits.year().min)
      this.year.set(this.limits.year().min);
    if (this.year() > this.limits.year().max)
      this.year.set(this.limits.year().max);
  }

  toggleSettings(): void {
    this.isSettingsPanelShown = !this.isSettingsPanelShown;
  }

  setCalendarLimits(row: SettingsPanelRow, selectedIndex: number): void {
    this.limits.setCalendarLimits(row.id, selectedIndex);
  }
  
  constructSections(): YearPickerSection[] {
    return SECTIONS.map(section => ({
      ...section,
      isCollapsed: section.id === SectionId.millennium,
      caption: computed<string>(() => 
        this.constructCaption(section.id, this.millennium(), this.century())
      ),
      rows: computed<YearPickerButtonRow[]>(() => 
        this.constructButtonRows(section.id, this.millennium(), this.century(), this.limits.extension())
      )
    }));
  }

  constructCaption(section: SectionId, millennium: number, century: number): string {
    switch (section) {
      case SectionId.century:
        return this.calendar.millenniumName(millennium, true);
      case SectionId.year:
        return this.calendar.centuryName(century, true);
      default:
        return '';
    }
  }

  constructButtonRows(
    section: SectionId,
    millennium: number,
    century: number,
    extension: LimitsExtention
  ): YearPickerButtonRow[] {
    switch (section) {
      case SectionId.millennium:
        return this.millenniumButtonRows(extension);
      case SectionId.century:
        return this.centuryButtonRows(millennium);
      case SectionId.year:
        return this.yearButtonRows(century);
    }
  }

  millenniumButtonRows(extension: LimitsExtention): YearPickerButtonRow[] {
    return this.utility.sequence(-1 - extension.start, 1 + extension.end)
      .filter(row => row)
      .map(row => ({
        id: row,
        name: '',
        isCollapsed: false,
        buttons: this.constructButtons(SectionId.millennium, row)
      }));
  }

  centuryButtonRows(millennium: number): YearPickerButtonRow[] {
    return [{
      id: millennium,
      name: this.calendar.millenniumName(millennium, true),
      isCollapsed: false,
      buttons: this.constructButtons(SectionId.century, millennium)
    }];
  }

  yearButtonRows(century: number): YearPickerButtonRow[] {
    const rows: YearPickerButtonRow[] = this.utility.sequence(0, DECADES_IN_CENTURY - 1).map(decade => {
      const row: number = century > 0
        ? DECADES_IN_CENTURY * (century - 1) + decade + 1
        : DECADES_IN_CENTURY * (century + 1) - decade - 1;
      return {
        id: decade,
        name: this.calendar.decadeName(century, decade),
        isCollapsed: !this.isDesktop && !this.calendar.decadeContainsYear(century, decade, this.year()),
        buttons: this.constructButtons(SectionId.year, row)
      }
    });
    return (century > 0 ? rows : rows.reverse());
  }

  constructButtons(section: SectionId, row: number): YearPickerButton[] {
    const rowLength: number = section === SectionId.millennium ? 5 : 10;
    const start: number = (row > 0 ? rowLength * (row - 1) + 1 : rowLength * row) + 
      (section === SectionId.year ? (row > 0 ? -1 : 1) : 0);
    const end: number = start + rowLength - 1;
    return this.utility.sequence(start, end).map(id => ({
      id,
      text: this.calendar.timePeriodName(section, id),
      bg: this.color.pickerButtonBackground(section, id)
    }));
  }

  toggleSection(section: YearPickerSection): void {
    if (this.isDesktop()) return;
    section.isCollapsed = !section.isCollapsed;
  }

  toggleRow(section: YearPickerSection, row: YearPickerButtonRow): void {
    if (!this.isMobile || section.id !== SectionId.year) return;
    row.isCollapsed = !row.isCollapsed;
  }

  pickPeriod(section: SectionId, id: number): void {
    if (!this.isPickerOpen()) {
      this.togglePicker();
      return;
    }
    switch (section) {
      case SectionId.millennium:
        this.millennium.set(id);
        break;
      case SectionId.century:
        this.century.set(id);
        this.millennium.set(this.calendar.getMillenniumFromCentury(id));
        break;
      case SectionId.year:
        this.year.set(id);
        this.century.set(this.calendar.getCenturyFromYear(id));
        this.millennium.set(this.calendar.getMillenniumFromYear(id));
        if (!this.isDesktop) this.togglePicker();
        break;
    }
  }

  shiftPeriod(section: SectionId, shift: -1 | 1) {
    let newValue: number;
    switch (section) {
      case SectionId.millennium:
        newValue = this.millennium() + shift;
        break;
      case SectionId.century:
        newValue = this.century() + shift;
        break;
      case SectionId.year:
        newValue = this.year() + shift;
        break;
    }
    if (!newValue) newValue += shift;
    this.pickPeriod(section, newValue);
  }

}
