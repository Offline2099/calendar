import { Component, signal, computed } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { HeaderComponent } from './components/01-header/header.component';
import { InfoComponent } from './components/02-info/info.component';
import { YearComponent } from './components/03-calendar/year/year.component';
import { YearPickerComponent } from './components/04-year-picker/year-picker.component';
import { FooterComponent } from './components/05-footer/footer.component';
import { ColorService } from './services/color.service';

@Component({
  selector: 'app-root',
  imports: [
    NgClass, NgStyle,
    HeaderComponent, InfoComponent, YearComponent, YearPickerComponent, FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  year = signal<number>(new Date().getFullYear());
  isPickerOpen = signal<boolean>(false);
  isOverlayShown = signal<boolean>(false);

  contentBackground = computed<string>(() => this.color.yearBackground(this.year()));

  constructor(private color: ColorService) {}

  toggleYearPicker(): void {
    this.isPickerOpen.update(value => !value);
  }

}
