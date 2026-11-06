/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FocusEvent, ChangeEvent } from 'react';

interface SmartManualInputProps {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  className?: string;
  id?: string;
}

export default function SmartManualInput({
  value,
  onChange,
  min,
  max,
  className = '',
  id
}: SmartManualInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState<string>('');

  // Keep local value in sync with prop when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString());
    }
  }, [value, isFocused]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value === 0) {
      setLocalValue('');
    } else {
      setLocalValue(value.toString());
    }
    // Select all text in the field on click/focus for fast typing
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setLocalValue(valStr);

    // Provide reactive feedback to parent immediately if we have a valid number
    const parsed = parseInt(valStr);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = parseInt(localValue);
    if (isNaN(parsed)) {
      parsed = 0;
    }
    // Safeguard bounds on blur
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setLocalValue(clamped.toString());
  };

  return (
    <input
      id={id}
      type="number"
      value={localValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}
