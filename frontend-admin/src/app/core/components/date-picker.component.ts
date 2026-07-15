import { Component, ElementRef, forwardRef, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

interface Cell {
  day: number;
  date: string | null;
  inMonth: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() placeholder = '';

  private _value = '';
  open = signal(false);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());
  disabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  private elRef = inject(ElementRef);

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  display = (): string => {
    if (!this._value) return '';
    const [y, m, d] = this._value.split('-');
    return `${y}/${m}/${d}`;
  };

  calendar = (): Cell[][] => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells: Cell[] = [];
    for (let i = 0; i < startDay; i++) {
      cells.push({ day: daysInPrev - startDay + 1 + i, date: null, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: `${year}-${pad(month + 1)}-${pad(d)}`, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length, date: null, inMonth: false });
    }

    const weeks: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  };

  isSelected(dateStr: string | null): boolean {
    return !!dateStr && dateStr === this._value;
  }

  writeValue(value: any): void {
    this._value = typeof value === 'string' && value ? value.slice(0, 10) : '';
    if (this._value) {
      const [y, m] = this._value.split('-').map(Number);
      if (y && m) {
        this.viewYear.set(y);
        this.viewMonth.set(m - 1);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.open()) {
      this.close();
    } else {
      this.syncView();
      this.open.set(true);
    }
  }

  private syncView(): void {
    const base = this._value || new Date().toISOString().slice(0, 10);
    const [y, m] = base.split('-').map(Number);
    this.viewYear.set(y);
    this.viewMonth.set(m - 1);
  }

  close(): void {
    this.open.set(false);
    this.onTouched();
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth.update((m) => m + 1);
    }
  }

  select(dateStr: string | null): void {
    if (!dateStr) return;
    this._value = dateStr;
    this.onChange(dateStr);
    this.open.set(false);
    this.elRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  clear(): void {
    this._value = '';
    this.onChange('');
    this.elRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
