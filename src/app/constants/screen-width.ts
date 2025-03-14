export enum ScreenWidthStatus {
  under600px,
  between600and900px,
  between900and1200px,
  between1200and1920px,
  between1920and2500px,
  over2500px
}

export enum ScreenWidthCategory {
  mobile,
  tablet,
  desktop
}

export const BREAKPOINTS: Record<ScreenWidthStatus, string> = {
  [ScreenWidthStatus.under600px]: '(max-width: 599px)',
  [ScreenWidthStatus.between600and900px]: '(min-width: 600px) and (max-width: 899px)',
  [ScreenWidthStatus.between900and1200px]: '(min-width: 900px) and (max-width: 1199px)',
  [ScreenWidthStatus.between1200and1920px]: '(min-width: 1200px) and (max-width: 1919px)',
  [ScreenWidthStatus.between1920and2500px]: '(min-width: 1920px) and (max-width: 2499px)',
  [ScreenWidthStatus.over2500px]: '(min-width: 2500px)'
}
