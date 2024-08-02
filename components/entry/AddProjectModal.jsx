
"use client";
import { createClient } from '@/utils/supabase/client';
import { React, use, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import ButtonSpinner from '@/components/interface/ButtonSpinner';

export default function AddProjectModal({isOpen, toggle, user_id, refreshData}) {
    const supabase = createClient()

    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        status: "",
        billable: false
    });

    const [loadingAddProject, setLoadingAddProject] = useState(false);

    

    const handleChange = (e) => {
        if (e.target.type === "checkbox") {
            setNewProject({
                ...newProject,
                [e.target.name]: e.target.checked
            });
            return
        } else {
            setNewProject({
                ...newProject,
                [e.target.name]: e.target.value
            });
        }
    }

    async function addProject() {
        

        try {

            setLoadingAddProject(true)
            await new Promise(r => setTimeout(r, 100))

            let { data, error } = await supabase
            .from("projects")
            .insert({
                name: newProject.name,
                description: newProject.description,
                status: newProject.status,
                user_id: user_id,
                billable: newProject.billable
            })

            setLoadingAddProject(false)

            if (error) {
            throw error;
            }
        } catch (error) {
            alert("Error adding project");
            console.log(error);
        } finally {
            refreshData()
            toggle();
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}><strong>Add a Project</strong></ModalHeader>
            <ModalBody>
                <Form >
                    <FormGroup>
                        <Label for="projectName">Name</Label>
                        <Input onChange={handleChange} type="text" name="name" id="projectName" placeholder="Project Name" disabled={loadingAddProject}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="projectDescription">Description</Label>
                        <Input onChange={handleChange} type="textarea" name="description" id="projectDescription" placeholder="Project Description" disabled={loadingAddProject}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="projectStatus">Status</Label>
                        <Input onChange={handleChange} type="text" name="status" id="projectStatus" placeholder="Project Status" disabled={loadingAddProject}/>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input onChange={handleChange} type="checkbox" name="billable" id="billable" />{' '}
                            Billable
                        </Label>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} style={{width:"150px"}} disabled={loadingAddProject}>Cancel</Button>
                <ButtonSpinner loading={loadingAddProject} color="primary" disabled={loadingAddProject} onClick={addProject} style={{width:"150px"}}>Add Project</ButtonSpinner>{' '}
            </ModalFooter>
        </Modal>
    )
}