import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

enum Direction {
  left = -1,
  right = 1
}

@Component({
  selector: 'app-two-way-buttons',
  imports: [NgClass],
  templateUrl: './two-way-buttons.component.html',
  styleUrl: './two-way-buttons.component.scss'
})
export class TwoWayButtonsComponent {

  isLeftDisabled = input<boolean>(false);
  isRightDisabled = input<boolean>(false);

  Direction = Direction;
  clickEvent = output<Direction>();

  onClick(direction: Direction): void {
    this.clickEvent.emit(direction);
  }

}
