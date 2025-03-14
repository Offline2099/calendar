import { Component, Signal, signal, model, computed } from '@angular/core';
import { NgClass } from '@angular/common';

enum ButtonId {
  info = 'info-button',
  yearPicker = 'year-picker-button'
}

interface ButtonData {
  id: ButtonId;
  isActive: Signal<boolean>;
  tooltip: ButtonTooltipData;
}

interface ButtonTooltipData {
  header: string;
  text: string;
}

const INFO_BUTTON_TOOLTIP: ButtonTooltipData = {
  header: 'View Info',
  text: 'Basic information about the Gregorian calendar and its structure.'
}

const YEAR_PICKER_BUTTON_TOOLTIP: ButtonTooltipData = {
  header: 'Pick Year',
  text: 'Select any year from the last ice age to the distant future to view the calendar.'
}

@Component({
  selector: '[app-header]',
  imports: [NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isPickerOpen = model.required<boolean>();
  isOverlayShown = model.required<boolean>();

  buttons: ButtonData[] = [
    {
      id: ButtonId.info,
      isActive: signal(false),
      tooltip: INFO_BUTTON_TOOLTIP
    },
    {
      id: ButtonId.yearPicker,
      isActive: computed<boolean>(() => this.isPickerOpen()),
      tooltip: YEAR_PICKER_BUTTON_TOOLTIP
    }
  ];

  onButtonClick(id: ButtonId): void {
    switch (id) {
      case ButtonId.info:
        this.isOverlayShown.update(value => !value);
        break;
      case ButtonId.yearPicker:
        this.isPickerOpen.update(value => !value);
        break;
    }
  }

}
