
"use client";
import { createClient } from '@/utils/supabase/client';
import { React, use, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

export default function AddProjectModal({isOpen, toggle, user_id, refreshData}) {
    const supabase = createClient()

    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        status: "",
    });

    const handleChange = (e) => {
        setNewProject({
            ...newProject,
            [e.target.name]: e.target.value
        });
    }

    async function addProject() {
        try {
            let { data, error } = await supabase
            .from("projects")
            .insert({
                name: newProject.name,
                description: newProject.description,
                status: newProject.status,
                user_id: user_id
            })

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
            <ModalHeader toggle={toggle}>Add a Project</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="projectName">Name</Label>
                        <Input onChange={handleChange} type="text" name="name" id="projectName" placeholder="Project Name" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="projectDescription">Description</Label>
                        <Input onChange={handleChange} type="textarea" name="description" id="projectDescription" placeholder="Project Description" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="projectStatus">Status</Label>
                        <Input onChange={handleChange} type="text" name="status" id="projectStatus" placeholder="Project Status" />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={addProject}>Add Project</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}