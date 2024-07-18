"use client";


import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import LiveTimeCounter from '@/components/entry/LiveTimeCounter';
import { React, use, useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import AddProjectModal from '@/components/entry/AddProjectModal';
import EditProjectModal from '@/components/entry/EditProjectModal';
import { IconPlus, IconPencil, IconCheck} from  '@tabler/icons-react'
import ProjectCard from '@/components/entry/ProjectCard';
import WorkSessionCard from '@/components/entry/WorkSessionCard';
import moment from 'moment';

function createGreetingString(currentTime, userName ) {
    if (currentTime < 12) {
      return `Good Morning ${userName}!`
    } else if (currentTime < 18) {
      return `Good Afternoon ${userName}!`
    } else {
      return `Good Evening ${userName}!`
    }
  }

export default function ProjectManager() {

  const supabase = createClient()

  const [user, setUser] = useState(null)

  const [projects, setProjects] =useState([]);
  const [loading, setLoading] = useState(true);

  const [canEdit, setCanEdit] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [currentWorkSession, setCurrentWorkSession] = useState(null);
  const [workSessions, setWorkSessions] = useState([]);

  const calculateElapsedTime = (startTime, stopTime) => {
    const start = moment(startTime);
    const stop = moment(stopTime);
    const duration = moment.duration(stop.diff(start));
    const hours = duration.asHours();
    return Math.round(hours * 4) / 4; // Round to nearest 0.25
}

 async function updateWorkSession(workSession) {
    try {
      const { data, error } = await supabase
      .from('worksession')
      .update([
        {...workSession}
      ])
      .eq('id', workSession.id)
      .select()

      if (error) {
        throw error;
      }
  
      if (data && data.length > 0) {
        refreshData('user useeffect')
        setCurrentWorkSession(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function saveWorkSession(workSession) {
    try {
      const { data, error } = await supabase
      .from('worksession')
      .insert([
        {...workSession}
      ])
      .select()

      if (error) {
        throw error;
      }
  
      console.log('got work session data', data)
      if (data && data.length > 0) {
        setCurrentWorkSession(data[0]); // Set currentWorkSession to the inserted work session with id
      }
    } catch (error) {
      console.log(error);
    }
  }

  function finishSession() {

    const updatedWorkSession = {
      ...currentWorkSession,
      //use format "2024-07-17T02:44:16.411+00:00"
      stop_time:  new Date().toISOString() 
    }
    console.log('finishing session', updatedWorkSession)
    updateWorkSession(updatedWorkSession)
  }

 function startWork(project) {
    console.log('starting work')
    saveWorkSession({
      project_id: project.id,
      start_time:  new Date().toISOString() ,
      stop_time: null,
      user_id: user.id
    })
  }

  async function getUser() {
    try {
      const {data: {user}} = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.log(error)
    }
  }

  async function getWorkSessions() {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // Set to midnight of today

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999); // Set to the last millisecond of today
      
      const { data, error } = await supabase
        .from("worksession")
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', startOfToday.toISOString())
        .lte('start_time', endOfToday.toISOString());
    

      if (error) {
        throw error;
      }

      

      //if there is a work session with no stop time, set it as the current work session
      const newCurrentWorkSession = data.find(workSession => !workSession.stop_time)
      if (newCurrentWorkSession) {
        console.log('FOUND CURRENT WORK SESSION', newCurrentWorkSession)
        setCurrentWorkSession(newCurrentWorkSession)
      }

      //set work sessions
      setWorkSessions(data)
    
    } catch (error) {
      console.log(error)
    }

  }

  function refreshData(from = null) {
    console.log('refreshing data from ', from)
    getProjects()
    getWorkSessions()
    getUser()
  }

    async function getProjects() {
      try {
        setLoading(true);

        let { data, error, status } = await supabase
          .from("projects")
          .select(
            `id, created_at, name, description, status, user_id`
          )

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
        setLoading(false);
      }
    }

    const [initialRefresh, setInitialRefresh] = useState(false)

    useEffect(() => {
      if (user && !initialRefresh) {
        refreshData('user useeffect')
        setInitialRefresh(true)
      }
      
    }, [user]);

    useEffect(() => {
        getUser()
    }, []);

    const currentTime = new Date().getHours()
    // format the time as Tuesday, July 16, 2019
    const dateTimeString = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    // format as HH:MM:SS
    //const formattedLiveTime = 
    const userName = 'Brad'
    const greetingString = createGreetingString(currentTime, userName)
  
    const totalHours = workSessions.reduce((acc, workSession) => {
      const start = workSession.start_time ? new Date(workSession.start_time).getTime() : null;
      const stop = workSession.stop_time ? new Date(workSession.stop_time).getTime() : null;
    
      if (start !== null && stop !== null) {
        const duration = (stop - start) / 1000 / 60 / 60; // Duration in hours
        const roundedDuration = Math.round(duration * 4) / 4; // Round to nearest 0.25
        return acc + roundedDuration;
      } else {
        return acc; // Return current accumulator if either start_time or stop_time is null
      }
    }, 0) ?? 0;
    
    /*{
      id: 1,
      project: 1,
      startTime: new Date('7/16/2024 10:00:00'),
      endTime: null
    }*/
  
    const currentProject = projects.find(project => project.id === currentWorkSession?.project_id)
    const workingOnString = currentProject ? `${currentProject.name}` : 'Select a project to start tracking time!'

    return (
        <Container>
        <Row>
          <Col>
          <Row>
            <Col>
              <h2 className="mt-5">{greetingString}</h2>
            </Col>
          </Row>
          <Row>
          <Col>
            <h5>{dateTimeString}</h5>
          </Col>
          </Row>
          </Col>
          <Col>
            <Card className='mt-5' style={{backgroundColor:"#F0F0F0", height:"6rem"}}>
              <CardBody>
            <Row>
                <Col>
                  <h5 className="mt-0">{workingOnString}</h5>
                </Col>
            </Row>
            <Row>
              <Col>
                {
                    currentWorkSession ? ( 
                        <Row>
                          <Col>
                          <LiveTimeCounter startTime={currentWorkSession?.start_time} />
                          </Col>
                          <Col>
                          <Button
                          style={{float:"right"}}
                          color="success"
                          onClick={finishSession}
                          >Stop Session</Button>
                          </Col>
                      
                        {/* <Button color="danger">Pause</Button> */}
                        
                        </Row>
                    ) : (
                        'Not working on anything at the moment'
                    )
                }

              </Col>
            </Row>
            </CardBody>
            </Card>
          </Col>
          
        </Row>


          <hr></hr>
        <Row>
        <Col xl="8">
          <h3 className='mb-0'>My Projects</h3>
          <p className='mt-0 mb-4' style={{fontSize:"14px", color:"grey"}}><strong>Work Orders and other tasks</strong></p>
            {
              projects?.sort((a,b) => (a.seq ?? 0) - (b.seq ?? 0)).map((project) => {
                return (
                  <ProjectCard key={project.id} startWork={startWork} project={project} canEdit={canEdit} setEditingProject={setEditingProject} setEditModal={setEditModal} refreshData={refreshData}/>
                )
              })
            }
             </Col>
        <Col xl="4">
            <h3 className='mb-0'>Today's Work</h3>
            <p className='mt-0 mb-4' style={{fontSize:"14px", color:"grey"}}><strong>Rounded to the nearest 15 min</strong></p>
            {
              workSessions?.sort((a,b) =>
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
              ).filter((s) => s.stop_time && calculateElapsedTime(s.start_time, s.stop_time) > 0).map((workSession) => {
                return (
                  <>
                  <WorkSessionCard updateWorkSession={updateWorkSession} workSession={workSession} projectName={projects.find(project => project.id === workSession.project_id)?.name} />
                  </>
                )
              }
              )
            }
            {/* Show total hours worked today */}


                <p tag="h6" className='mt-3' style={{float:"right"}}><strong>Total Hours: {totalHours.toFixed(2)} hrs</strong></p>

        </Col>
        </Row>
        {/* center this button */}
        <Row >
          <Col xl="8">
            <Button className="mt-3 mb-5" color="clear" onClick={() => {setCanEdit(!canEdit)}}>
              {
                canEdit ? (<><IconCheck/> Done Editing</>) : (
                  <><IconPencil/> Manage Projects</>
                )
              }
            </Button>
            <Button style={{float:"right"}} className="mt-3" onClick={() => {
              setCreateModal(true)
            }} color="primary"><IconPlus/> Add Project</Button>

            <AddProjectModal isOpen={createModal} toggle={() => setCreateModal(!createModal)} user_id={user?.id} refreshData={getProjects}/>
            <EditProjectModal isOpen={editModal} toggle={() => setEditModal(!editModal)} user_id={user?.id}  projectData={editingProject} refreshData={refreshData}/>
            
          </Col>
        </Row>
      </Container>
    )
}