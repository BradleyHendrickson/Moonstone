import { React, useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import moment from 'moment';
import ButtonSpinner from '@/components/interface/ButtonSpinner';
import Select from 'react-select';
import SelectProject from '@/components/interface/SelectProject';

export default function EditWorkSessionModal({ workSession, projectName, project, isOpen, toggle, updateWorkSession, supabaseClient }) {
    const [startTime, setStartTime] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedProjectVL, setSelectedProjectVL] = useState(null);
    const [description, setDescription] = useState(workSession.description);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleDelete = async () => {
    }

    useEffect(() => {
        // Extract the time portion from the start and stop times
        const initialStartTime = moment(workSession.start_time).format('HH:mm');
        const initialStopTime = moment(workSession.stop_time).format('HH:mm');

        setStartTime(initialStartTime);
        setStopTime(initialStopTime);

        setSelectedProjectVL({
            value: project,
            label: projectName
        });

    }, [isOpen, workSession.start_time, workSession.stop_time]);

    const handleUpdate = async () => {
        setLoadingUpdate(true);

        // Combine the date part from the original timestamp with the updated time part
        const newStartTime = moment(workSession.start_time).format('YYYY-MM-DD') + 'T' + startTime;
        const newStopTime = moment(workSession.stop_time).format('YYYY-MM-DD') + 'T' + stopTime;

        console.log("start time: ", newStartTime);
        console.log("stop time: ", newStopTime);

        // Convert to ISO format with the correct timezone offset
        const adjustedStartTime = moment(newStartTime).toISOString();
        const adjustedStopTime = moment(newStopTime).toISOString();

        await updateWorkSession({
            id: workSession.id,
            start_time: adjustedStartTime,
            stop_time: adjustedStopTime,
            description: description,
            project_id: selectedProjectVL.value.id
        });

        setLoadingUpdate(false);
        toggle();
    }

    const updateStartTime = (e) => {
        setStartTime(e.target.value);
    }

    const updateStopTime = (e) => {
        setStopTime(e.target.value);
    }

    const onChangeProject = (selectedOption) => {
        if (selectedOption) {
            setSelectedProjectVL({
                value: selectedOption.value,
                label: selectedOption.label
            });
        } else {
            setSelectedProjectVL(null);
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}><strong>Edit Work Session</strong></ModalHeader>
            <ModalBody>
                <Row>
                    <Col>
                    <SelectProject 
                        supabase={supabaseClient}
                        value={selectedProjectVL}
                        onChange={onChangeProject}
                    />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label for="start_time">Start Time</Label>
                            <Input type="time" name="start_time" id="start_time" value={startTime} onChange={updateStartTime} disabled={loadingUpdate} />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Label for="stop_time">Stop Time</Label>
                            <Input type="time" name="stop_time" id="stop_time" value={stopTime} onChange={updateStopTime} disabled={loadingUpdate} />
                        </FormGroup>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button style={{ width: "100px" }} disabled={loadingUpdate || loadingDelete} color="secondary" onClick={toggle}>Cancel</Button>
                <ButtonSpinner
                    loading={loadingUpdate}
                    disabled={loadingUpdate}
                    color="primary"
                    onClick={handleUpdate}
                    style={{ width: "100px" }}
                >
                    Save
                </ButtonSpinner>
               
            </ModalFooter>
        </Modal>
    );
}
