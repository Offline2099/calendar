import { Component } from '@angular/core';

interface FooterLink {
  text: string;
  url: string;
}

const FOOTER_LINKS: FooterLink[] = [
  {
    text: 'View repository',
    url: 'https://github.com/Offline2099/calendar'    
  },
  {
    text: 'Other projects',
    url: 'https://offline2099.github.io'    
  }
];

@Component({
  selector: '[app-footer]',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  readonly footerLinks = FOOTER_LINKS;
  
}
