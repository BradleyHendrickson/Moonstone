'use client';

import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button, Spinner } from 'reactstrap';
import LiveTimeCounter from '@/components/entry/LiveTimeCounter';
import { React, use, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AddProjectModal from '@/components/entry/AddProjectModal';
import EditProjectModal from '@/components/entry/EditProjectModal';
import { IconPlus, IconPencil, IconCheck, IconCaretDown, IconCaretUp } from '@tabler/icons-react';
import ProjectCard from '@/components/entry/ProjectCard';
import WorkSessionCard from '@/components/entry/WorkSessionCard';
import moment from 'moment';
import { poppins } from '@/utils/fonts';
import StartedTime from '@/components/entry/StartedTime';
//import ButtonSpinner from '../interface/ButtonSpinner';
import LoadingPlaceholder from '@/components/interface/LoadingPlaceholder';
import { roundingOptions } from '@/utils/constants';
import StartWorkModal from '@/components/entry/StartWorkModal';


export default function ProjectManager() {
	const supabase = createClient();

	const [user, setUser] = useState(null);
	const [projects, setProjects] = useState([]);
	const [loadingProjects, setLoadingProjects] = useState(true);
	const [loadingWorkSessions, setLoadingWorkSessions] = useState(true);
	const [canEdit, setCanEdit] = useState(false);
	const [editingProject, setEditingProject] = useState(null);
	const [createModal, setCreateModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [currentWorkSession, setCurrentWorkSession] = useState(null);
	const [workSessions, setWorkSessions] = useState([]);
	const [showAll, setShowAll] = useState(false);
	const [config, setConfig] = useState({});
	const [initialProjectLoad, setInitialProjectLoad] = useState(true);
	const [initialWorkSessionLoad, setInitialWorkSessionLoad] = useState(true);

	const [loadingStartTime, setLoadingStartTime] = useState(false);

	const [startWorkModal, setStartWorkModal] = useState(false);

	const calculateElapsedTime = (startTime, stopTime, minSessionLength) => {
		const start = moment(startTime);
		const stop = moment(stopTime);
		const duration = moment.duration(stop.diff(start));
		const hours = duration.asHours();
		//return Math.round(hours * 4) / 4; // Round to nearest 0.25
		return Math.round(hours * (1/minSessionLength)) / (1/minSessionLength); // Round to nearest 0.25
	};

	function updateStartTime(newStartTime, project_id) {
		const updatedWorkSession = {
			...currentWorkSession,
			start_time:  newStartTime ?? currentWorkSession.start_time,
			project_id: project_id ?? currentWorkSession.project_id
		};

		updateWorkSession(updatedWorkSession);
	}

    async function deleteWorkSession(workSessionId) {
        try {
            const { data, error } = await supabase
                .from('worksession')
                .delete()
                .eq('id', workSessionId)
                .select();
            
            if (error) {
                throw error;
            }
    
            if (data && data.length > 0) {
                refreshData('user useeffect');
                setCurrentWorkSession(null);
            }
        } catch (error) {
            console.log(error);
        } finally {
            // You can add any final cleanup or state reset here if needed
        }
    }    

	async function updateWorkSession(workSession) {
		try {
			const { data, error } = await supabase
				.from('worksession')
				.update([{ ...workSession }])
				.eq('id', workSession.id)
				.select();
	
			if (error) {
				throw error;
			}
	
			if (data && data.length > 0) {
				refreshData('user useeffect');
				setCurrentWorkSession(null);
			}
		} catch (error) {
			console.log(error);
		} finally {

		}
	}

	async function saveWorkSession(workSession) {
		try {
			const { data, error } = await supabase
				.from('worksession')
				.insert([{ ...workSession }])
				.select();

			if (error) {
				throw error;
			}

			if (data && data.length > 0) {
				setCurrentWorkSession(data[0]); // Set currentWorkSession to the inserted work session with id
			}
		} catch (error) {
			console.log(error);
		}
	}

	function finishSession(session) {
		const updatedWorkSession = {
			...session,
			//use format "2024-07-17T02:44:16.411+00:00"
			stop_time: new Date().toISOString()
		};
		console.log('finishing session', updatedWorkSession);
		updateWorkSession(updatedWorkSession);
	}

	function startWork(project) {
		//if there is a current work session, finish it
		if (currentWorkSession) {
			finishSession(currentWorkSession);
		}

		//start a new work session
		saveWorkSession({
			project_id: project.id,
			start_time: new Date().toISOString(),
			stop_time: null,
			user_id: user.id
		});
	}

	async function getUser() {
		try {
		  const {
			data: { user }
		  } = await supabase.auth.getUser();
		  setUser(user);
	  
		  if (user) {
			// Fetch the related record from the usersettings table
			const { data, error } = await supabase
			  .from('usersettings')
			  .select('config')
			  .eq('user_id', user.id)
			  .single();
	  
			if (error && error.code === 'PGRST116') {
			  // No row exists, create a new one
			  const { data: newData, error: newError } = await supabase
				.from('usersettings')
				.insert({ user_id: user.id, config: {} })
				.select()
				.single();
	  
			  if (newError) {
				throw newError;
			  }
	  
			  setConfig(newData.config);
			} else if (error) {
			  throw error;
			} else {
			  setConfig(data.config);
			}
		  }
		} catch (error) {
		  console.log(error);
		}
	  }
	  

	async function getWorkSessions() {
		try {
			setLoadingWorkSessions(true);

			const startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0); // Set to midnight of today

			const endOfToday = new Date();
			endOfToday.setHours(23, 59, 59, 999); // Set to the last millisecond of today

			const { data, error } = await supabase
				.from('worksession')
				.select('*')
				.eq('user_id', user?.id)
				.gte('start_time', startOfToday.toISOString())
				.lte('start_time', endOfToday.toISOString());

			if (error) {
				throw error;
			}

			//if there is a work session with no stop time, set it as the current work session
			const newCurrentWorkSession = data.find((workSession) => !workSession.stop_time);
			if (newCurrentWorkSession) {
				console.log('FOUND CURRENT WORK SESSION', newCurrentWorkSession);
				setCurrentWorkSession(newCurrentWorkSession);
			}

			//set work sessions
			setWorkSessions(data);
		} catch (error) {
			console.log(error);
		} finally {
			setLoadingWorkSessions(false);
			setInitialWorkSessionLoad(false);
		}
	}

	function refreshData(from = null) {
		console.log('refreshing data from ', from);
		getProjects();
		getWorkSessions();
		getUser();
	}

	async function getProjects() {
		try {
			setLoadingProjects(true);
			

			let { data, error, status } = await supabase
				.from('projects')
				.select(`id, created_at, name, description, status, user_id, billable, seq, hidden`);

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				setProjects(data);
			}
		} catch (error) {
			//alert("Error loading messages!");
			console.log(error);
		} finally {
			setInitialProjectLoad(false);
			setLoadingProjects(false);
		}
	}

	const [initialRefresh, setInitialRefresh] = useState(false);

	useEffect(() => {
		if (user && !initialRefresh) {
			refreshData('user useeffect');
			setInitialRefresh(true);
		}
	}, [user]);

	useEffect(() => {
		getUser();
	}, []);

	const currentTime = new Date().getHours();
	// format the time as Tuesday, July 16, 2019
	const dateTimeString = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	// format as HH:MM:SS
	//const formattedLiveTime =
	const userName = 'Brad';
	const minSessionLength = config?.minSessionLength ?? 0.25;

	const totalHours =
		workSessions.reduce((acc, workSession) => {
			const start = workSession.start_time ? new Date(workSession.start_time).getTime() : null;
			const stop = workSession.stop_time ? new Date(workSession.stop_time).getTime() : null;

			if (start !== null && stop !== null) {
				const duration = (stop - start) / 1000 / 60 / 60; // Duration in hours
				//const roundedDuration = Math.round(duration * 4) / 4; // Round to nearest 0.25
				const roundedDuration = Math.round(duration * (1/minSessionLength)) / (1/minSessionLength); // Round to nearest minSessionLength
				return acc + roundedDuration;
			} else {
				return acc; // Return current accumulator if either start_time or stop_time is null
			}
		}, 0) ?? 0;

	const totalBillableHours =
		workSessions.reduce((acc, workSession) => {
			const project = projects.find((project) => project.id === workSession.project_id);
			if (project && project.billable) {
				const start = workSession.start_time ? new Date(workSession.start_time).getTime() : null;
				const stop = workSession.stop_time ? new Date(workSession.stop_time).getTime() : null;

				if (start !== null && stop !== null) {
					const duration = (stop - start) / 1000 / 60 / 60; // Duration in hours
					const roundedDuration = Math.round(duration * (1/minSessionLength)) / (1/minSessionLength); // Round to nearest minSessionLength
					return acc + roundedDuration;
				}
			}
			return acc;
		}, 0) ?? 0;

	/*{
      id: 1,
      project: 1,
      startTime: new Date('7/16/2024 10:00:00'),
      endTime: null
    }*/

	const currentProject = projects.find((project) => project.id === currentWorkSession?.project_id);
	const workingOnString = currentProject ? `${currentProject.name}` : 'Start a new session!';

	const projectLimitAmount = 5;
	const filteredProjects = projects?.filter((project) => !project.hidden) ?? []; //project.hidden
	const sortedProjects =
		filteredProjects?.sort((a, b) => {
			if (a.billable === b.billable) {
				return (a.seq ?? 0) - (b.seq ?? 0);
			}
			return a.billable ? -1 : 1;
		}) ?? [];

	const projectsToShow = showAll || canEdit ? sortedProjects : sortedProjects.slice(0, projectLimitAmount);
	//get a count of projects hidden
	const hiddenProjectsCount = sortedProjects.length - projectsToShow.length;

	return (
		<Container>
			<Row>
				<Col>
					<Card className="mt-3 mt-md-5" style={{ backgroundColor: '#F0F0F0'}}>
						<CardBody>
							<Row>
								<Col>
									<h5	
										//use text-muted if canEdit
										className={canEdit ? 'text-muted mt-0' : 'mt-0'}
										style={{
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}
									>
										{workingOnString}
									</h5>
								</Col>
								<Col>
									<StartedTime startTime={currentWorkSession?.start_time} updateStartTime={updateStartTime} muted={canEdit} projectData={projects}
										currentProject={currentProject}
									/>
								</Col>
							</Row>
							<Row>
								<Col>
									<StartWorkModal isOpen={startWorkModal} toggle={() => setStartWorkModal(!startWorkModal)} user_id={user?.id} projectData={projects} refreshData={refreshData} supabaseClient={supabase} startWork={startWork}/>
									{currentWorkSession ? (
										<Row>
											<Col>
												<LiveTimeCounter startTime={currentWorkSession?.start_time} muted={canEdit} />
											</Col>
											<Col>
												<Button style={{ float: 'right' }} color="success" onClick={() => finishSession(currentWorkSession)}>
													Stop Session
												</Button>
											</Col>

											{/* <Button color="danger">Pause</Button> */}
										</Row>
									) : (
										<Row>
											<Col xs="auto">
												<p>Not working on anything at the moment.</p>
											</Col>
											<Col>
											<Button
											style={{ float: 'right' }}
											color="primary"
											onClick={() => {
												setStartWorkModal(true)
											}}
										>
											Start Work
										</Button>	
											</Col>
										</Row>

									)}
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			<hr></hr>
			<Row>
				{/*}
				<Col xl="8">
					<Row>
						<Col>
							<h3 className="mb-0">My Projects</h3>
						</Col>
						<Col>
							<Button
								style={{ float: 'right', width: '200px' }}
								onClick={() => {
									setCreateModal(true);
								}}
								color="primary"
							>
								<IconPlus /> Add Project
							</Button>
							<AddProjectModal isOpen={createModal} toggle={() => setCreateModal(!createModal)} user_id={user?.id} refreshData={getProjects} />
							<EditProjectModal
								isOpen={editModal}
								toggle={() => setEditModal(!editModal)}
								user_id={user?.id}
								projectData={editingProject}
								refreshData={refreshData}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							<p className="mt-0 mb-3 d-none d-sm-block" style={{ fontSize: '14px', color: 'grey' }}>
								<strong>Work Orders and other tasks</strong>
							</p>
						</Col>
						<Col>
							<Button
								style={{ float: 'right', width: '200px' }}
								className="mt-1"
								color={canEdit ? 'secondary' : 'clear'}
								onClick={() => {
									setCanEdit(!canEdit);
								}}
							>
								{canEdit ? (
									<>
										<IconCheck /> Done Editing
									</>
								) : (
									<>
										<IconPencil /> Manage Projects
									</>
								)}
							</Button>
						</Col>
					</Row>
					
					{loadingProjects && initialProjectLoad && (!projects || projects.length == 0) ? (
						<>
						<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2'/>
						<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2' />
						<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2'/>
						<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2'/>
						<LoadingPlaceholder width='100%' height='45px' cornerRadius='5px' className='mt-2'/>
						</>

					) : (
						projectsToShow.map((project) => (
							<ProjectCard
								key={project.id}
								currentWorkSession={currentWorkSession}
								startWork={startWork}
								project={project}
								canEdit={canEdit}
								setEditingProject={setEditingProject}
								setEditModal={setEditModal}
								refreshData={refreshData}
							/>
						))
					)}
					<Row>
						<Col
							//center the contents horizontally
							className="d-flex justify-content-center"
						>
							<>
								{!canEdit && !showAll && projects.length > projectLimitAmount && (
									<Button color="secondary" style={{ width: '50%' }} outline onClick={() => setShowAll(true)} className="mt-3 mb-5">
										Show More ({hiddenProjectsCount}) <IconCaretDown />
									</Button>
								)}
								{!canEdit && showAll && (
									<Button color="secondary" style={{ width: '50%' }} onClick={() => setShowAll(false)} className="mt-3  mb-5">
										Show Less <IconCaretUp />
									</Button>
								)}
							</>
						</Col>
					</Row>
				</Col>
				*/}
				<Col>
					<h3 className="mt-4 mt-xl-0 mb-0">Today's Work</h3>
					<p className="mt-0 mb-4" style={{ fontSize: '14px', color: 'grey' }}>
						<strong>Rounded to the nearest {
							roundingOptions.find((option) => option.value == minSessionLength)?.label
							}</strong>
					</p>
					{loadingWorkSessions && initialWorkSessionLoad && (!workSessions || workSessions.length == 0) ? (
						<>
						<LoadingPlaceholder width='100%' height='23px' cornerRadius='2px' className='mt-2' />
						<LoadingPlaceholder width='100%' height='23px' cornerRadius='2px' className='mt-2'/>
						<LoadingPlaceholder width='100%' height='23px' cornerRadius='2px' className='mt-2'/>
						<LoadingPlaceholder width='100%' height='23px' cornerRadius='2px' className='mt-2' />
						</>
					) : (
						workSessions
							?.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
							.filter((s) => s.stop_time && calculateElapsedTime(s.start_time, s.stop_time, minSessionLength) > 0)
							.map((workSession) => {
								return (
										<WorkSessionCard
											key={workSession.id}
											updateWorkSession={updateWorkSession}
											deleteWorkSession={deleteWorkSession}
											workSession={workSession}
											projectName={projects.find((project) => project.id === workSession.project_id)?.name}
											project = {projects.find((project) => project.id === workSession.project_id)}
											minSessionLength={minSessionLength}
											supabaseClient={supabase}
										/>
								);
							})
					)}

					{/* Show total hours worked today */}

					<Row>
						<Col>
							{
								(loadingWorkSessions && initialWorkSessionLoad) ? (
									<LoadingPlaceholder width='200px' height='23px' cornerRadius='2px' className="mt-2 mb-0" style={{float:"right"}}/>
								)
								:
								(
									<p tag="h6" className="mt-3 mb-0" style={{ float: 'right' }}>
										<strong className={poppins.className}>Total Hours: {totalHours.toFixed(2)} hrs</strong>
									</p>
								)
							}
						</Col>
					</Row>
					<Row>
						<Col>
							{
								(loadingWorkSessions && initialWorkSessionLoad) ? (
									<LoadingPlaceholder width='200px' height='23px' cornerRadius='2px' className="mt-2" style={{float:"right"}} />
								)
								:
								(
									<p tag="h6" className="mt-0" style={{ float: 'right', color: "green" }}>
										<strong className={poppins.className}>Billable Hours: {totalBillableHours.toFixed(2)} hrs</strong>
									</p>
								)
							}
						</Col>
					</Row>
				</Col>
			</Row>
			<Row>
				<div
					style={{
						height: '50px'
					}}
				></div>
			</Row>
		</Container>
	);
}
