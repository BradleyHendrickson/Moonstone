'use client'
import { Container, Row, Col, Button } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AddProjectModal from '@/components/entry/AddProjectModal';
import EditProjectModal from '@/components/entry/EditProjectModal';
import { IconPlus, IconPencil, IconCheck, IconCaretDown, IconCaretUp, IconArchive, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import ProjectCard from '@/components/entry/ProjectCard';
import LoadingPlaceholder from '@/components/interface/LoadingPlaceholder';

export default function ProjectsPage() {
	const supabase = createClient();

	const [user, setUser] = useState(null);
	const [projects, setProjects] = useState([]);
	const [loadingProjects, setLoadingProjects] = useState(true);
	const [canEdit, setCanEdit] = useState(false);
	const [editingProject, setEditingProject] = useState(null);
	const [createModal, setCreateModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [showAll, setShowAll] = useState(false);
	const [showArchived, setShowArchived] = useState(false); // New state for archived projects view
	const [initialProjectLoad, setInitialProjectLoad] = useState(true);
	const [initialRefresh, setInitialRefresh] = useState(false);

	async function getUser() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			setUser(user);
		} catch (error) {
			console.log(error);
		}
	}

	async function getProjects() {
		try {
			setLoadingProjects(true);
			const { data, error } = await supabase
				.from('projects')
				.select('id, created_at, name, description, status, user_id, billable, seq, hidden')
				.eq('hidden', showArchived); // Show archived or active projects

			if (error) {
				throw error;
			}

			if (data) {
				setProjects(data);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setInitialProjectLoad(false);
			setLoadingProjects(false);
		}
	}

	useEffect(() => {
		if (user && (!initialRefresh)) {
			getProjects();
			setInitialRefresh(true);
		}
	}, [user]); // Refresh projects when showArchived changes

	useEffect(() => {
		getProjects();
	}, [showArchived]); // Refresh projects when showArchived changes

	useEffect(() => {
		getUser();
	}, []);

	// Function to toggle archived state of a project
	async function toggleArchiveProject(project) {
		try {
			const { error } = await supabase
				.from('projects')
				.update({ hidden: !project.hidden })
				.eq('id', project.id);

			if (error) {
				throw error;
			}

			getProjects(); // Refresh projects after toggling archive state
		} catch (error) {
			console.log(error);
		}
	}

	const projectLimitAmount = 10;
	const sortedProjects = projects.sort((a, b) => (a.billable === b.billable) ? 0 : a.billable ? -1 : 1);
	const projectsToShow = showAll || canEdit ? sortedProjects : sortedProjects.slice(0, projectLimitAmount);
	const hiddenProjectsCount = projects.length - projectsToShow.length;

	return (
		<Container>
			<Row>
				<Col>
					<Row>
						{/* ADD 2rem of empty space in this row  */}
						<div style={{ height: '4rem' }}></div>
					</Row>
					<Row>
						<Col>
							<h3 className="mb-4">{showArchived ? 'Archived Projects' : 'My Projects'}</h3>
						</Col>
						<Col lg="6" xl="auto">
							{/* Flex container for header buttons */}
							<div className="d-flex flex-column flex-lg-row">
								<Button
									className="mb-2 mb-lg-0 me-lg-2"
									color={showArchived ? 'primary' : 'clear'}
									onClick={() => setShowArchived(!showArchived)}
								>
									{showArchived ? <><IconArrowLeft /> Back to Projects</> : <><IconArchive /> Archived Projects</>}
								</Button>

								<Button
									onClick={() => setCreateModal(true)}
									color="primary"
									disabled={showArchived}
								>
									<IconPlus /> Add Project
								</Button>
							</div>
						</Col>

					</Row>
					<Row>
						<div style={{ height: '1rem' }}></div>
					</Row>
					{loadingProjects && initialProjectLoad ? (
						<>
							<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
							<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
							<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
							<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
							<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
						</>
					) : (
						projectsToShow?.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								canEdit={true}
								setEditingProject={setEditingProject}
								setEditModal={setEditModal}
								refreshData={getProjects}
								disableClick
								toggleArchive={() => toggleArchiveProject(project)} // Add archive toggle function
								isArchived={showArchived}
							/>
						))
					)}
					<EditProjectModal
						isOpen={editModal}
						toggle={() => setEditModal(!editModal)}
						user_id={user?.id}
						projectData={editingProject}
						refreshData={getProjects}
						/>
					<Row>
						<Col className="d-flex justify-content-center">
							<>
								{!canEdit && !showAll && projects.length > projectLimitAmount && (
									<Button color="secondary" style={{ width: '50%' }} outline onClick={() => setShowAll(true)} className="mt-3 mb-5">
										Show More ({hiddenProjectsCount}) <IconCaretDown />
									</Button>
								)}
								{!canEdit && showAll && (
									<Button color="secondary" style={{ width: '50%' }} onClick={() => setShowAll(false)} className="mt-3 mb-5">
										Show Less <IconCaretUp />
									</Button>
								)}
							</>
						</Col>
					</Row>
				</Col>
			</Row>
			<Row>
				<div style={{ height: '50px' }}></div>
			</Row>
		</Container>
	);
}
