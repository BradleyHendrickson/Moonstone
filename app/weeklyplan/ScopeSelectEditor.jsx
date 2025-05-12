import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef, memo } from 'react';
import Select from 'react-select';

const ScopeSelectEditor = memo(
    forwardRef((props, ref) => {
        const [selectedOption, setSelectedOption] = useState(null);
        const [data, setData] = useState([]);
        const selectRef = useRef(null);

        useEffect(() => {
            
            //console.log('props.values', props);
            const initial = props.values?.find((opt) => opt.value === props.value);
            setSelectedOption(initial || null);
        }, [props.values, props.value]);

        useEffect(() => {
            setTimeout(() => {
                if (selectRef.current) {
                    selectRef.current.focus();
                }
            });
        }, []);

        const handleChange = (option) => {
           // console.log('handleChange', option);

            if (props.updateRow) {
                props.updateRow({
                    ...props.data,
                    [props.column.colId]: option.value
                });
            }

            setSelectedOption(option);
            setTimeout(() => {
                props.stopEditing();
            });
        };

        useImperativeHandle(ref, () => ({
            getValue: () => selectedOption?.value || null,
            isCancelBeforeStart: () => false,
            isCancelAfterEnd: () => false
        }));

        return (
            <Select
                key={`${props.value}-${props.values?.length}`}
                inputRef={selectRef}
                value={selectedOption}
                onChange={handleChange}
                options={props.values}
                menuIsOpen={props.values?.length > 0}
                autoFocus
                styles={{
                    container: (base) => ({
                        ...base,
                        width: '100%'
                    })
                }}
                menuPortalTarget={document.body}
                menuPosition="absolute"
                menuPlacement="auto"
            />
        );
    })
);

export default ScopeSelectEditor;
