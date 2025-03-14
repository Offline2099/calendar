import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-selection-panel',
  imports: [NgClass],
  templateUrl: './selection-panel.component.html',
  styleUrl: './selection-panel.component.scss'
})
export class SelectionPanelComponent {

  text = input.required<string>();
  options = input.required<string[]>();
  selectedIndex = input.required<number>();

  selectOption = output<number>()

  selectIndex(index: number): void {
    this.selectOption.emit(index);
  }

}
