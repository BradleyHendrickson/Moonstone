"use client";
import { createClient } from '@/utils/supabase/client';
import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

export default function EditProjectModal({ isOpen, toggle, user_id, projectData, refreshData }) {
    const supabase = createClient();

    const [editedProject, setEditedProject] = useState({
        id: projectData?.id,
        name: projectData?.name,
        description: projectData?.description,
        status: projectData?.status,
    });

    useEffect(() => {
        if (!projectData) return;
        setEditedProject({
            id: projectData.id,
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
        });
    }, [projectData]);

    const handleChange = (e) => {
        setEditedProject({
            ...editedProject,
            [e.target.name]: e.target.value
        });
    }

    
    async function updateProject() {
        try {
            let { data, error } = await supabase
                .from("projects")
                .update({
                    name: editedProject.name,
                    description: editedProject.description,
                    status: editedProject.status,
                })
                .eq("id", editedProject.id)
                .eq("user_id", user_id);

            if (error) {
                throw error;
            }
        } catch (error) {
            alert("Error updating project");
            console.error(error);
        } finally {
            refreshData();
            toggle();
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Edit Project</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="editProjectName">Name</Label>
                        <Input onChange={handleChange} type="text" name="name" id="editProjectName" value={editedProject.name} placeholder="Project Name" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="editProjectDescription">Description</Label>
                        <Input onChange={handleChange} type="textarea" name="description" id="editProjectDescription" value={editedProject.description} placeholder="Project Description" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="editProjectStatus">Status</Label>
                        <Input onChange={handleChange} type="text" name="status" id="editProjectStatus" value={editedProject.status} placeholder="Project Status" />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={updateProject}>Save Changes</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
}
