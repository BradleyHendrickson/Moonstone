'use client';
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import React, { use, useEffect, useState } from 'react';
import moment from 'moment'; // Ensure moment.js is installed
import { IconPencil } from '@tabler/icons-react';
import Select from 'react-select';

export default function StartedTime({ startTime, updateStartTime, muted, projectData, currentProject}) {
	const [isHovered, setIsHovered] = useState(false);
	const [modal, setModal] = useState(false);
	const [newStartTime, setNewStartTime] = useState(startTime);
	const [selectedProject, setSelectedProject] = useState(currentProject);

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
		setSelectedProject(currentProject);
		setNewStartTime(startTime);
		setModal(!modal);
	};

	const handleSave = () => {
		updateStartTime(newStartTime, selectedProject?.id);
		toggleModal();
	};

    const projectSelections = projectData.map(project => ({
        value: project,
        label: project.name
    }));

	return (
		<>
			<p	
				className='mb-0 mt-0 text-muted'
				style={{ whiteSpace: "nowrap", float: "right", cursor: 'pointer', textDecoration: isHovered ? 'underline' : 'none' }}
				// style={{ whiteSpace: "nowrap", marginBottom: "5px" cursor: 'pointer', textDecoration: isHovered ? 'underline' : 'none' }}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={toggleModal}
			>
				{isHovered && (
					<span style={{ marginRight: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'underline' }}>
						<IconPencil size={16} style={{ marginRight: '5px' }} />
					</span>
				)}
				started {startTime ? formattedStartTime : 'N/A'}

			</p>
			<Modal isOpen={modal} toggle={toggleModal}>
				<ModalHeader toggle={toggleModal}>Edit Work Session</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Label for="project">Project</Label>
						<Select
                        options={projectSelections}
                        onChange={selectedOption => setSelectedProject(selectedOption ? selectedOption.value : null)}
                        value={{
                            value: selectedProject,
                            label:  selectedProject ?  selectedProject.name : '...'
                        }}
                        //isClearable
                    />
					</FormGroup>
					<FormGroup>
						<Label for="startTime">Start Time</Label>
						<Input
						type="time"
						value={moment(newStartTime).format('HH:mm')}
						onChange={(e) => setNewStartTime(moment(e.target.value, 'HH:mm').toDate())}
					/>
					</FormGroup>

				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={handleSave}>Save</Button>{' '}
					<Button color="secondary" onClick={toggleModal}>Cancel</Button>
				</ModalFooter>
			</Modal>
		</>
	);
}
