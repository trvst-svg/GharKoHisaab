declare module 'nepali-date-converter' {
  export default class NepaliDate {
    constructor(date?: Date | string | number);
    constructor(year: number, month: number, date: number);
    
    getYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
    
    setYear(year: number): void;
    setMonth(month: number): void;
    setDate(date: number): void;
    
    format(formatStr: string): string;
    toJsDate(): Date;
    static parse(dateStr: string): NepaliDate;
  }
}
