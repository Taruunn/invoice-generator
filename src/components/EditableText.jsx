import React, { useRef, useEffect } from 'react';

/**
 * EditableText — inline contentEditable text block for direct invoice editing.
 * Uncontrolled approach: only syncs innerHTML on mount / value change from parent.
 */
export default function EditableText({
    value,
    onChange,
    placeholder = '',
    className = '',
    tag: Tag = 'div',
    style = {},
}) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== value) {
            ref.current.innerHTML = value || '';
        }
    }, [value]);

    const handleBlur = () => {
        if (onChange) {
            onChange(ref.current.innerHTML);
        }
    };

    const isEmpty = !value || value === '' || value === '<br>';

    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            className={`editable-text ${className}`}
            style={style}
            data-placeholder={placeholder}
            data-empty={isEmpty.toString()}
            dangerouslySetInnerHTML={{ __html: value || '' }}
        />
    );
}
