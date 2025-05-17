'use client';

import { React, useState } from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const WeekPlannerSettingsModal = ({ isOpen, toggle, spacing, setSpacing, includeClosed, setIncludeClosed, refreshToken, token }) => {
	const [showToken, setShowToken] = useState(false);
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
					<FormGroup check className='mt-3 mb-5'>
						<Label check>
							<Input 
								type="checkbox"
								checked={includeClosed}
								onChange={(e) => setIncludeClosed(e.target.checked)}
							/> 
							Include Closed Work Orders
						</Label>
					</FormGroup>
				<hr />
					<h5>Debug Utilities</h5>

					<Button color="primary" className="mt-3" onClick={refreshToken}>
						Refresh Token
					</Button>
					<Button
						color="secondary"
						className="mt-3 ml-2 ms-2"
						onClick={() => setShowToken((prev) => !prev)}
					>
						<FontAwesomeIcon icon={faEye} />
					</Button>


				</FormGroup>
				{showToken && (
					<FormGroup>
						<Label for="token">Token</Label>
						<Input
							type="textarea"
							id="token"
							value={token}
							rows={10}
							readOnly
						/>
					</FormGroup>
				)}
				{/* checkbox to include closed work orders */}

			</ModalBody>
		</Modal>
	);
};

export default WeekPlannerSettingsModal;
