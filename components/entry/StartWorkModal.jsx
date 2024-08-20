"use client";
import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Card, CardBody } from 'reactstrap';
import Select from 'react-select';
import ButtonSpinner from '@/components/interface/ButtonSpinner';
import ProjectCard from "./ProjectCard";
import AddProjectModal from "./AddProjectModal"; // Import the AddProjectModal component

export default function StartWorkModal({ isOpen, toggle, projectData, supabaseClient, user_id, refreshData, startWork }) {
    const [selectedProject, setSelectedProject] = useState(null);
    const [loadingStartWork, setLoadingStartWork] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [recentProjects, setRecentProjects] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingProject, setIsAddingProject] = useState(false); // State to manage the add project modal

    async function getRecentProjects() {
        try {
            setLoadingProjects(true);
    
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999); // Set to the last millisecond of today
    
            const startOfWeek = new Date();
            startOfWeek.setDate(endOfToday.getDate() - 30); // Go back 30 days
            startOfWeek.setHours(0, 0, 0, 0); // Set to midnight of 30 days ago
    
            const { data: recentProjects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .gte('created_at', startOfWeek.toISOString())
            .lte('created_at', endOfToday.toISOString())
            .eq('hidden', false) // Exclude projects where hidden is true
            .limit(5); // Limit to 5 recent projects
        
    
            if (error) {
                console.error('Error fetching recent projects:', error);
                throw error;
            }
    
            setRecentProjects(recentProjects);
        } catch (error) {
            console.error('Error fetching recent projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    }
    
    useEffect(() => {
        getRecentProjects();
    }, []);

    const projectSelections = projectData.map(project => ({
        value: project,
        label: project.name
    }));

    const toggleAddProjectModal = () => {
        setIsAddingProject(!isAddingProject);
    };

    const handleAddProject = () => {
        toggleAddProjectModal();
    };

    const handleCreateProject = (newProject) => {
        refreshData();
        // Perform any additional actions needed upon project creation
        // For example, update recent projects or selected project state
        toggleAddProjectModal();
        getRecentProjects(); // Refresh recent projects list after adding a new project

        //set the new project as the selected project
        setSelectedProject(newProject);
    };


    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Start Work Session</ModalHeader>
                <ModalBody>
                    <h6 className="mt-2">Recent Projects</h6>
                    {loadingProjects ? (
                        <div>Loading...</div>
                    ) : (
                        <>
                            {recentProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    isHovered={isHovered}
                                    setIsHovered={setIsHovered}
                                    startWork={() => {}}
                                    onClick={() => setSelectedProject(project)}
                                />
                            ))}
                        </>
                    )}

                    <Label for="project" className="mt-4">Select a project</Label>
                    <Select
                        options={projectSelections}
                        onChange={selectedOption => setSelectedProject(selectedOption ? selectedOption.value : null)}
                        value={{
                            value: selectedProject,
                            label: selectedProject ? selectedProject.name : '...'
                        }}
                        isClearable
                    />

                    <h6 className="mt-4">Or create a new project</h6>
                    <Button color="secondary" onClick={handleAddProject}>Create New Project</Button>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                    <ButtonSpinner color="primary" disabled={!selectedProject} onClick={() => {
                        startWork(selectedProject)
                        toggle()
                    }} 
                        loading={loadingStartWork}>Start Work</ButtonSpinner>
                </ModalFooter>
            </Modal>

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isAddingProject}
                toggle={toggleAddProjectModal}
                user_id={user_id}
                refreshData={handleCreateProject} // Pass refresh function to update recent projects
            />
        </>
    );
}
