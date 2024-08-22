import { React, useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col, Alert } from 'reactstrap';
import moment from 'moment';
import ButtonSpinner from '@/components/interface/ButtonSpinner';
import SelectProject from '@/components/interface/SelectProject';

export default function EditWorkSessionModal({ workSession, projectName, project, isOpen, toggle, updateWorkSession, supabaseClient, deleteWorkSession}) {
    const [startTime, setStartTime] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [selectedProjectVL, setSelectedProjectVL] = useState(null);
    const [description, setDescription] = useState(workSession.description);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
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

        const newStartTime = moment(workSession.start_time).format('YYYY-MM-DD') + 'T' + startTime;
        const newStopTime = moment(workSession.stop_time).format('YYYY-MM-DD') + 'T' + stopTime;

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
    };

    const handleDelete = async () => {
        setLoadingDelete(true);
        await deleteWorkSession(workSession.id);
        setLoadingDelete(false);
        toggle();
    };

    const updateStartTime = (e) => {
        setStartTime(e.target.value);
    };

    const updateStopTime = (e) => {
        setStopTime(e.target.value);
    };

    const onChangeProject = (selectedOption) => {
        if (selectedOption) {
            setSelectedProjectVL({
                value: selectedOption.value,
                label: selectedOption.label
            });
        } else {
            setSelectedProjectVL(null);
        }
    };

    const toggleConfirmation = () => {
        setShowConfirmation(!showConfirmation);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}><strong>Edit Work Session</strong></ModalHeader>
            <ModalBody>
                {showConfirmation && (
                    <Alert color="danger">
                        <h4 className="alert-heading">Are you sure?</h4>
                        <p>Do you really want to delete this work session? This action cannot be undone.</p>
                        <div className="d-flex justify-content-end">
                            <Button color="secondary" style={{marginRight:"1rem"}} onClick={toggleConfirmation} disabled={loadingDelete}>No, Don't Delete</Button>
                            <ButtonSpinner
                                loading={loadingDelete}
                                disabled={loadingDelete}
                                color="danger"
                                onClick={handleDelete}
                                className="ml-2"
                            >
                                Yes, Delete
                            </ButtonSpinner>
                        </div>
                    </Alert>
                )}
                {!showConfirmation && (
                    <>
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
                                    <Input type="time" name="start_time" id="start_time" value={startTime} onChange={updateStartTime} disabled={loadingUpdate || loadingDelete} />
                                </FormGroup>
                            </Col>
                            <Col>
                                <FormGroup>
                                    <Label for="stop_time">Stop Time</Label>
                                    <Input type="time" name="stop_time" id="stop_time" value={stopTime} onChange={updateStopTime} disabled={loadingUpdate || loadingDelete} />
                                </FormGroup>
                            </Col>
                        </Row>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                {!showConfirmation && (
                    <>
                        <Button style={{ width: "100px" }} disabled={loadingUpdate || loadingDelete} color="secondary" onClick={toggle}>Cancel</Button>
                        <Button
                            color="danger"
                            onClick={toggleConfirmation}
                            disabled={loadingUpdate || loadingDelete}
                            style={{ width: "100px" }}
                        >
                            Delete
                        </Button>
                        
                        <ButtonSpinner
                            loading={loadingUpdate}
                            disabled={loadingUpdate || loadingDelete}
                            color="primary"
                            onClick={handleUpdate}
                            style={{ width: "100px" }}
                        >
                            Save
                        </ButtonSpinner>

                    </>
                )}
            </ModalFooter>
        </Modal>
    );
}
