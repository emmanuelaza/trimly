'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  name?: string;
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  id?: string;
  autoFocus?: boolean;
}

function toDigits(v: number | string | undefined): string {
  if (v === undefined || v === null || v === '') return '';
  return String(v).replace(/\D/g, '');
}

function formatDisplay(digits: string): string {
  if (!digits) return '';
  const n = parseInt(digits, 10);
  if (isNaN(n)) return '';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { name, value, defaultValue, onChange, placeholder = '0', className, required, disabled, min, id, autoFocus },
  ref,
) {
  const initial = toDigits(value ?? defaultValue);
  const [display, setDisplay] = useState(formatDisplay(initial));
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== undefined && value !== prevValue.current) {
      prevValue.current = value;
      const d = toDigits(value);
      setDisplay(formatDisplay(d));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    setDisplay(formatDisplay(digits));
    onChange?.(digits ? parseInt(digits, 10) : 0);
  }

  const rawValue = toDigits(value ?? display);

  return (
    <>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn('tabular-nums', className)}
      />
      {name && <input type="hidden" name={name} value={rawValue} />}
    </>
  );
});
