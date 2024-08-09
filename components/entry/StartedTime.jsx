'use client';
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment'; // Ensure moment.js is installed
import { IconPencil } from '@tabler/icons-react';

export default function StartedTime({ startTime, updateStartTime, muted }) {
	const [isHovered, setIsHovered] = useState(false);
	const [modal, setModal] = useState(false);
	const [newStartTime, setNewStartTime] = useState(startTime);

	if (!startTime) {
		return null;
	}

	const formattedStartTime = moment(startTime).format('hh:mm A');

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	const toggleModal = () => {
		setNewStartTime(startTime);
		setModal(!modal);
	};

	const handleSave = () => {
		updateStartTime(newStartTime);
		toggleModal();
	};


	return (
		<>
			<p	
				className='mb-0 mt-0 text-muted'
				style={{ float: "right", cursor: 'pointer', textDecoration: isHovered ? 'underline' : 'none' }}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={toggleModal}
			>
				started {startTime ? formattedStartTime : 'N/A'}
				{isHovered && (
					<span style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}>
						<IconPencil size={16} style={{ marginRight: '5px' }} />
					</span>
				)}
			</p>
			<Modal isOpen={modal} toggle={toggleModal}>
				<ModalHeader toggle={toggleModal}>Edit Start Time</ModalHeader>
				<ModalBody>
					<Input
						type="time"
						value={moment(newStartTime).format('HH:mm')}
						onChange={(e) => setNewStartTime(moment(e.target.value, 'HH:mm').toDate())}
					/>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={handleSave}>Save</Button>{' '}
					<Button color="secondary" onClick={toggleModal}>Cancel</Button>
				</ModalFooter>
			</Modal>
		</>
	);
}
