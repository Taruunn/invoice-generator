'use client';

import React, { useRef } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * DateInput — clickable formatted date that opens native date picker.
 */
export default function DateInput({ value, onChange, style = {} }) {
    const inputRef = useRef(null);

    const formatDate = (v) => {
        if (!v || !v.includes('-')) return v || '';
        const [y, m, d] = v.split('-');
        const monthIdx = parseInt(m, 10) - 1;
        const monthName = MONTHS[monthIdx]?.slice(0, 3) || m;
        return `${monthName} ${parseInt(d, 10)}, ${y}`;
    };

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.showPicker?.();
            inputRef.current.focus();
        }
    };

    return (
        <span
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                color: 'inherit',
                fontWeight: 'inherit',
                minHeight: 24,
                ...style,
            }}
            onClick={handleClick}
        >
            {formatDate(value)}
            <input
                ref={inputRef}
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    opacity: 0,
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    pointerEvents: 'none',
                }}
            />
        </span>
    );
}
