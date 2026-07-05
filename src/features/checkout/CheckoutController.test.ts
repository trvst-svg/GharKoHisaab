import { getCycleDates } from './CheckoutController';
import NepaliDate from 'nepali-date-converter';

describe('getCycleDates B.S. Billing Cycle Math', () => {
  it('correctly calculates cycle dates when checkout day is equal to or after anniversary day', () => {
    // Start date: 2083 Ashadh 15 (A.D. 2026-06-29)
    const startDateAD = new Date('2026-06-29T12:00:00Z');
    
    // Checkout date: 2083 Ashadh 20 (A.D. 2026-07-04)
    const checkoutDateAD = new Date('2026-07-04T12:00:00Z');

    const result = getCycleDates(startDateAD, checkoutDateAD);

    // Expect cycle start: 2083 Ashadh 15 (A.D. 2026-06-29)
    expect(result.cycleStartBS.getYear()).toBe(2083);
    expect(result.cycleStartBS.getMonth()).toBe(2); // 0-indexed (Ashadh = 3rd month = index 2)
    expect(result.cycleStartBS.getDate()).toBe(15);

    // Expect cycle end: 2083 Shrawan 15 (A.D. 2026-07-30)
    expect(result.cycleEndBS.getYear()).toBe(2083);
    expect(result.cycleEndBS.getMonth()).toBe(3); // Shrawan = index 3
    expect(result.cycleEndBS.getDate()).toBe(15);
  });

  it('correctly calculates cycle dates when checkout day is before anniversary day', () => {
    // Start date: 2083 Ashadh 15 (A.D. 2026-06-29)
    const startDateAD = new Date('2026-06-29T12:00:00Z');
    
    // Checkout date: 2083 Shrawan 10 (A.D. 2026-07-25)
    const checkoutDateAD = new Date('2026-07-25T12:00:00Z');

    const result = getCycleDates(startDateAD, checkoutDateAD);

    // Checkout B.S. is 2083 Shrawan 10. Anniversary is 15th.
    // Since 10 < 15, we are in the cycle from Ashadh 15 to Shrawan 15.
    expect(result.cycleStartBS.getYear()).toBe(2083);
    expect(result.cycleStartBS.getMonth()).toBe(2); // Ashadh
    expect(result.cycleStartBS.getDate()).toBe(15);

    expect(result.cycleEndBS.getYear()).toBe(2083);
    expect(result.cycleEndBS.getMonth()).toBe(3); // Shrawan
    expect(result.cycleEndBS.getDate()).toBe(15);
  });

  it('safely handles month transitions and varying month lengths in B.S.', () => {
    // Start date: 2083 Ashadh 31 (A.D. 2026-07-15)
    const startDateAD = new Date('2026-07-15T12:00:00Z');
    
    // Checkout date: 2083 Bhadra 05 (A.D. 2026-08-21)
    const checkoutDateAD = new Date('2026-08-21T12:00:00Z');

    const result = getCycleDates(startDateAD, checkoutDateAD);

    // Checkout B.S. is 2083 Bhadra 05. Anniversary is 31st.
    // Since 5 < 31, we are in the cycle starting Shrawan 31 (or last day of Shrawan) and ending Bhadra 31.
    // Let's verify start month is Shrawan (index 3) and end month is Bhadra (index 4).
    expect(result.cycleStartBS.getMonth()).toBe(3); // Shrawan
    expect(result.cycleEndBS.getMonth()).toBe(4);   // Bhadra
  });
});
