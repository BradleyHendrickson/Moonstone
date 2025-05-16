'use client';

import React from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';

const WeekPlannerSettingsModal = ({ isOpen, toggle, spacing, setSpacing, includeClosed, setIncludeClosed }) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalHeader toggle={toggle}>Planner Settings</ModalHeader>
			<ModalBody>
				<FormGroup>
					<Label for="spacingRange">Column Spacing</Label>
					<Input
						type="range"
						id="spacingRange"
						min={5}
						max={100}
						step={1}
						value={spacing}
						onChange={(e) => setSpacing(parseInt(e.target.value))}
					/>
					<div className="text-muted mt-1">Current: {spacing/10}px</div>
				</FormGroup>
				{/* checkbox to include closed work orders */}
				<FormGroup check>
					<Label check>
						<Input 
							type="checkbox"
							checked={includeClosed}
							onChange={(e) => setIncludeClosed(e.target.checked)}
						/> 
						Include Closed Work Orders
					</Label>
				</FormGroup>
			</ModalBody>
		</Modal>
	);
};

export default WeekPlannerSettingsModal;
