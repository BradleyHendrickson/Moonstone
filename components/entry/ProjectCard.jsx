import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { IconGripVertical, IconCurrencyDollar } from '@tabler/icons-react';

function ProjectCard({ project, canEdit, setEditingProject, setEditModal, refreshData, startWork, currentWorkSession, archiveProject }) {
	const [isHovered, setIsHovered] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const toggleModal = () => setIsModalOpen(!isModalOpen);

	const handleCardClick = () => {
		if (currentWorkSession?.project_id === project.id) {
			return;
		}

		if (currentWorkSession) {
			toggleModal();
		} else {
			if (!canEdit) {
				startWork(project);
			}
			setIsHovered(false);
		}
	};

	const confirmSwitch = () => {
		toggleModal();
		startWork(project);
		setIsHovered(false);
	};

	return (
		<>
			<Card
				key={project.id}
				className={`mt-2 ${isHovered ? 'highlight' : ''} ${currentWorkSession?.project_id === project.id ? 'pulsing-card' : ''}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleCardClick}
				style={{
					cursor: canEdit ? 'default' : 'pointer',
					backgroundColor: isHovered && !canEdit ? '#e0e0e0' : '#F0F0F0'
				}}
			>
				<CardBody className="p-2">
					<Row>
						{canEdit && (
							<Col xs="auto" className="d-flex align-items-center">
								<IconGripVertical />
							</Col>
						)}
						<Col>
							<CardTitle tag="h6">{project.name}</CardTitle>
						</Col>
						{project.billable && (
							<Col xs="auto">
								<IconCurrencyDollar title="Billable Project" />
							</Col>
						)}
						{canEdit && (
							<Col xs="auto">
								<Button
									size="sm"
									color="secondary"
									outline
									style={{ float: 'right', marginRight: '5px', width: "50px" }}
									onClick={() => {
										setEditingProject(project);
										setEditModal(true);
									}}
								>
									Edit
								</Button>
							</Col>
						)}
					</Row>
				</CardBody>
			</Card>

			<Modal isOpen={isModalOpen} toggle={toggleModal}>
				<ModalHeader toggle={toggleModal}>Confirm Switch</ModalHeader>
				<ModalBody>
					You are currently working on another project. Are you sure you want to switch to "{project.name}"?
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={toggleModal}>Cancel</Button>
					<Button color="primary" onClick={confirmSwitch}>Yes, Switch</Button>{' '}
				</ModalFooter>
			</Modal>
		</>
	);
}

export default ProjectCard;
