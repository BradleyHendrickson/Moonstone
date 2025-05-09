import React, { useEffect, useRef, forwardRef } from 'react';
import Select from 'react-select';

const WOSelectEditor = forwardRef((props, ref) => {
	const selectRef = useRef(null);

	// Expose focus method to parent via ref
	React.useImperativeHandle(ref, () => ({
		focus: () => {
			if (selectRef.current) {
				selectRef.current.focus();
			}
		},
	}));
  
	const options = props.options || [];
	const value = options.find((opt) => opt.value === props.value) || null;
  
	const [selectedValue, setSelectedValue] = React.useState(value);
  
	useEffect(() => {
	  setTimeout(() => {
		if (selectRef.current) {
		  selectRef.current.focus();
		}
	  });
	}, []);
  
	const handleChange = (newValue) => {
	  setSelectedValue(newValue);
  
	  // Update the value in the grid using setDataValue
	  const newCellValue = newValue.value; // Only use the 'value' field to update
	  //check type of newCellValue, it should be string

	  props.node.setDataValue(props.colDef.field, newCellValue.toString());  // Update specific cell value
  
	  props.api.stopEditing(); // Stop editing after selection
	};
  
	return (
	  <div style={{ width: 300 }}>
		<Select
		  ref={selectRef}
		  options={options}
		  value={selectedValue}
		  onChange={handleChange} // Ensure onChange triggers value update
		  menuPortalTarget={document.body}
		  menuPosition="absolute"
		  menuPlacement="auto"
		/>
	  </div>
	);
  });
  

export default WOSelectEditor;
