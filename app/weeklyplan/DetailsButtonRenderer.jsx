import React from 'react'

const DetailsButtonRenderer = (props) => {
	const handleClick = (e) => {
		e.preventDefault()
		props.onShowDetails(props.data)
	}
	if (props.node.rowPinned) return null; // Don't render in summary row
	return (
		<a href="#" onClick={handleClick}>
			View Details
		</a>
	)
}

export default DetailsButtonRenderer
