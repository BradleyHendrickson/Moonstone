import { React, useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import moment from 'moment';
import ButtonSpinner from '@/components/interface/ButtonSpinner';

export default function EditWorkSessionModal({ workSession, projectName, isOpen, toggle, updateWorkSession }) {
    const [startTime, setStartTime] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [description, setDescription] = useState(workSession.description);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        // Extract the time portion from the start and stop times
        const initialStartTime = moment(workSession.start_time).format('HH:mm');
        const initialStopTime = moment(workSession.stop_time).format('HH:mm');

        setStartTime(initialStartTime);
        setStopTime(initialStopTime);
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
            description: description
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

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}><strong>Edit Work Session</strong></ModalHeader>
            <ModalBody>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label for="project">Project</Label>
                            <Input type="text" name="project" id="project" value={projectName} disabled />
                        </FormGroup>
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
                <ButtonSpinner
                    loading={loadingUpdate}
                    disabled={loadingUpdate}
                    color="primary"
                    onClick={handleUpdate}
                    style={{ width: "150px" }}
                >
                    Update
                </ButtonSpinner>
                <Button style={{ width: "150px" }} disabled={loadingUpdate} color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
}
