import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { IconGripVertical, IconCurrencyDollar } from '@tabler/icons-react';
import ButtonSpinner from '@/components/interface/ButtonSpinner';

function ProjectCard({ project, canEdit, setEditingProject, setEditModal, refreshData, startWork, currentWorkSession, archiveProject, onClick, disableClick, isArchived, toggleArchive }) {
	const [isHovered, setIsHovered] = useState(false);
	const [isWorkSessionModalOpen, setIsWorkSessionModalOpen] = useState(false);
	const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

	const [loadingArchive, setLoadingArchive] = useState(false);

	const toggleWorkSessionModal = () => setIsWorkSessionModalOpen(!isWorkSessionModalOpen);
	const toggleRestoreModal = () => setIsRestoreModalOpen(!isRestoreModalOpen);

	const handleCardClick = (event) => {
		if (disableClick) {	
			return;
		}

		if (onClick) {
			onClick(event);
		}

		if (currentWorkSession?.project_id === project.id) {
			return;
		}

		if (currentWorkSession) {
			toggleWorkSessionModal();
		} else {
			if (!canEdit) {
				startWork(project);
			}
			setIsHovered(false);
		}
	};

	const confirmSwitch = () => {
		toggleWorkSessionModal();
		startWork(project);
		setIsHovered(false);
	};

	const confirmRestore = async () => {
		setLoadingArchive(true);  // Start loading spinner
	
		try {
			await toggleArchive();  // Perform the archive toggle (restore action)
		} catch (error) {
			console.error("Error restoring the project:", error);
		} finally {
			setLoadingArchive(false);  // Stop loading spinner
			toggleRestoreModal();  // Close the modal
		}
	}
	
	const editClick = (event) => {
		setEditingProject(project);
		setEditModal(true);
	}

	return (
		<>
			<Card
				key={project.id}
				className={`mt-2 ${isHovered ? 'highlight' : ''} ${currentWorkSession?.project_id === project.id ? 'pulsing-card' : ''}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={editClick}
				style={{
					cursor: canEdit ? 'default' : 'pointer',
					backgroundColor: isArchived 
						? (isHovered && canEdit ? '#f5f5f5' : '#fafafa') // Lighter colors for archived
						: (isHovered && canEdit ? '#e0e0e0' : '#F0F0F0'), // Current colors for non-archived
						border: isArchived ? '1px dashed darkgrey' : undefined
				}}

			>
				<CardBody className="p-2">
					<Row>
						<Col>
							<CardTitle tag="h6">{project.name}</CardTitle>
						</Col>
						{project.billable && (
							<Col xs="auto">
								<IconCurrencyDollar title="Billable Project" />
							</Col>
						)}
						{isArchived && (
							<Col xs="auto">
								<Button
									size="sm"
									color="secondary"
									style={{ float: 'right', marginRight: '5px', width: "100px" }}
									onClick={(event) => {
										event.stopPropagation();
										toggleRestoreModal(); // Open the restore confirmation dialog
									}}
								>
									Restore
								</Button>
							</Col>
						)}
					</Row>
				</CardBody>
			</Card>

			{/* Modal for confirming work session switch */}
			<Modal isOpen={isWorkSessionModalOpen} toggle={toggleWorkSessionModal}>
				<ModalHeader toggle={toggleWorkSessionModal}>Confirm Switch</ModalHeader>
				<ModalBody>
					You are currently working on another project. Are you sure you want to switch to "{project.name}"?
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={toggleWorkSessionModal}>Cancel</Button>
					<Button color="primary" onClick={confirmSwitch}>Yes, Switch</Button>
				</ModalFooter>
			</Modal>

			{/* Modal for confirming restore action */}
			<Modal isOpen={isRestoreModalOpen} toggle={toggleRestoreModal}>
				<ModalHeader toggle={toggleRestoreModal}>Confirm Restore</ModalHeader>
				<ModalBody>
					Are you sure you want to restore the project "{project.name}"?
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" disabled={loadingArchive} onClick={toggleRestoreModal}>Cancel</Button>
					<ButtonSpinner loading = {loadingArchive} color="primary" disabled={loadingArchive} onClick={confirmRestore}>Yes, Restore</ButtonSpinner>
				</ModalFooter>
			</Modal>
		</>
	);
}

export default ProjectCard;
