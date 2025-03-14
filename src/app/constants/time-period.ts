enum PeriodType {
  millennium = 'millennium',
  century = 'century',
  year = 'year',
  month = 'month',
  week = 'week',
  day = 'day'
}

export enum TimePeriodLong {
  millennium = PeriodType.millennium,
  century = PeriodType.century,
  year = PeriodType.year
}

export enum TimePeriodShort {
  year = PeriodType.year,
  month = PeriodType.month,
  week = PeriodType.week,
  day = PeriodType.day
}
