'use client';

import { React, useState } from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const WeekPlannerSettingsModal = ({ isOpen, toggle, spacing, setSpacing, refreshToken, token }) => {
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
			</ModalBody>
		</Modal>
	);
};

export default WeekPlannerSettingsModal;
