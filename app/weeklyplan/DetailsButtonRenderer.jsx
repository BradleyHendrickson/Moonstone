import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical} from '@fortawesome/free-solid-svg-icons'

const DetailsButtonRenderer = (props) => {
	const handleClick = (e) => {
		e.preventDefault()
		props.onShowDetails(props.data)
	}
	if (props.node.rowPinned) return null; // Don't render in summary row
	return (
		<a href="#" onClick={handleClick} style={{ textDecoration: 'none', color: 'black' }}>
			<FontAwesomeIcon icon={faEllipsisVertical} size="lg" color="black" />
		</a>
		
	)
}

export default DetailsButtonRenderer
