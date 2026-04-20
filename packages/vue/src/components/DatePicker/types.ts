export type DatePickerMode = 'single' | 'range';
export type DatePickerRole = 'start' | 'end';
export type DatePickerVariant = 'a' | 'b' | 'c';

export interface DateRangeValue {
  startDate: Date | null;
  endDate: Date | null;
}

export type DatePickerValue = Date | null | DateRangeValue;
