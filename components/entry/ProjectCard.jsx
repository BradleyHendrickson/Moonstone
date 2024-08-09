import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { IconGripVertical, IconReceipt2, IconCurrencyDollar, IconClock, IconArchive } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';

import '/components/styles/styles.css';

function ProjectCard({ project, canEdit, setEditingProject, setEditModal, refreshData, startWork, currentWorkSession, archiveProject }) {
	const [isHovered, setIsHovered] = useState(false);

	const handleCardClick = () => {
		if (currentWorkSession?.project_id === project.id) {
			return;
		}

		if (!canEdit) {
			startWork(project);
		}
		setIsHovered(false);
	};

	return (
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
					{/* 
					{isHovered && !canEdit && (
						<Col xs="auto">
							<IconClock size={20} style={{ marginLeft: 5, cursor: 'pointer' }} />
							<strong style={{ textDecoration: 'underline', marginLeft: 5 }}>
								{currentWorkSession?.project_id == project.id ? `` : currentWorkSession ? `Switch to This` : `Work on This`}
							</strong>
						</Col>
					)}
						*/}
					{canEdit && (
						<Col xs="auto">
							<Button
								size="sm"
								color="secondary"
								outline
								style={{ float: 'right', marginRight: '5px', width:"50px" }}
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
	);
}

export default ProjectCard;
