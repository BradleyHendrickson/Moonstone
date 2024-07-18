import React, { useState } from 'react';
import { Card, CardBody, CardTitle, CardText,CardSubtitle, Button, Row, Col } from 'reactstrap';

import '/components/styles/styles.css';
function ProjectCard({ project, canEdit, setEditingProject, setEditModal, refreshData, startWork }) {
    const [isHovered, setIsHovered] = useState(false);

    async function deleteProject(id, user_id) {
        const supabase = createClient();
    
        try {
            let { data, error } = await supabase
                .from("projects")
                .delete()
                .eq("id", id)
                .eq("user_id", user_id);
    
            if (error) {
                throw error;
            }
    
            return data;
        } catch (error) {
            console.error("Error deleting project:", error);
            return null;
        }
    }

    return (
        <Card
            key={project.id}
            className="mt-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            
        >
            <CardBody className='p-2' style={{backgroundColor: "#F0F0F0"}}>
                <Row>
                    <Col>
                        <CardTitle tag="h6">{project.name}</CardTitle>
                        {/*<CardText style={{fontSize:"14px", fontStyle:"italic"}} className="mb-2 text-muted">{project.status}</CardText>*/}
                    </Col>
                    {
                        canEdit ? (
                            <Col xs="auto">
                                <Button
                                    size='sm'
                                    color="danger"
                                    style={{ float: "right" }}
                                    onClick={async () => {
                                        await deleteProject(project.id, project.user_id);
                                        refreshData('project card');
                                    }}
                                >
                                    Delete
                                </Button>
                                <Row>
                                    <Col>
                                        <Button
                                        size='sm'
                                            color="secondary"
                                            style={{ float: "right" }}
                                            onClick={() => {
                                                setEditingProject(project);
                                                setEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        ) : (
                            <Col xs="auto">
                                <Button
                                size='sm'
                                    color="secondary"
                                    className={`start-work-button ${isHovered ? 'show' : ''}`}
                                    style={{ float: "right" }}
                                    onClick={() => startWork(project)}
                                >
                                    Start Work
                                </Button>
                            </Col>
                        )
                    }
                </Row>
            </CardBody>
        </Card>
    );
}

export default ProjectCard;
