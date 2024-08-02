"use client";
import { createClient } from '@/utils/supabase/client';
import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import ButtonSpinner from '@/components/interface/ButtonSpinner';

export default function EditProjectModal({ isOpen, toggle, user_id, projectData, refreshData }) {
    const supabase = createClient();

    const [loadingArchiveProject, setLoadingArchiveProject] = useState(false);
    const [loadingUpdateProject, setLoadingUpdateProject] = useState(false);

    const [editedProject, setEditedProject] = useState({
        id: projectData?.id,
        name: projectData?.name,
        description: projectData?.description,
        status: projectData?.status,
        billable: projectData?.billable,
    });

    useEffect(() => {
        if (!projectData) return;
        setEditedProject({
            id: projectData.id,
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            billable: projectData?.billable,
        });
    }, [projectData]);

    const handleChange = (e) => {
        if (e.target.type === "checkbox") {
            setEditedProject({
                ...editedProject,
                [e.target.name]: e.target.checked
            });
            return;
        } else {
            setEditedProject({
                ...editedProject,
                [e.target.name]: e.target.value
            });
        }
    }

    async function archiveProject() {
            setLoadingArchiveProject(true);
            //set the hidden field to true
            try {
                let { data, error } = await supabase
                    .from("projects")
                    .update({
                        hidden: true
                    })
                    .eq("id", editedProject.id)
                    .eq("user_id", user_id)
                    .select()
                    ;

                console.log('got back from archive', data, error);
                
                if (error) {
                    throw error;
                }
            } catch (error) {
                setLoadingArchiveProject(false);
                alert("Error archiving project");
                console.error(error);
            } finally {
                setLoadingArchiveProject(false);
                refreshData('refreshed upon archive');
                toggle();
            }
        }

    async function updateProject() {
        setLoadingUpdateProject(true);
        try {
            let { data, error } = await supabase
                .from("projects")
                .update({
                    name: editedProject.name,
                    description: editedProject.description,
                    status: editedProject.status,
                    billable: editedProject.billable
                })
                .eq("id", editedProject.id)
                .eq("user_id", user_id)
                .select()
                ;

            console.log('got back from update', data, error);

            if (error) {
                throw error;
            }
        } catch (error) {
            setLoadingArchiveProject(false);
            alert("Error updating project");
            console.error(error);
        } finally {
            setLoadingUpdateProject(false);
            refreshData();
            toggle();
        }
    }

    const loading = loadingArchiveProject || loadingUpdateProject;

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}><strong>Edit Project</strong></ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="editProjectName">Name</Label>
                        <Input onChange={handleChange} type="text" name="name" id="editProjectName" value={editedProject.name} placeholder="Project Name" disabled={loading}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="editProjectDescription">Description</Label>
                        <Input onChange={handleChange} type="textarea" name="description" id="editProjectDescription" value={editedProject.description} placeholder="Project Description" disabled={loading}/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="editProjectStatus">Status</Label>
                        <Input onChange={handleChange} type="text" name="status" id="editProjectStatus" value={editedProject.status} placeholder="Project Status" disabled={loading}/>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input onChange={handleChange} type="checkbox" name="billable" id="editProjectBillable" checked={editedProject.billable} disabled={loading} />
                            Billable
                        </Label>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <ButtonSpinner color="danger" onClick={archiveProject} loading={loadingArchiveProject} disabled={loading} style={{width:"150px"}}>Archive Project</ButtonSpinner>
                <ButtonSpinner color="primary" onClick={updateProject} loading={loadingUpdateProject} disabled={loading} style={{width:"150px"}}>Save Changes</ButtonSpinner>
                <Button color="secondary" onClick={toggle} disabled={loading} style={{width:"150px"}}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
}
