

import {React, useEffect, useState} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col} from 'reactstrap';
import moment from 'moment';

export default function EditWorkSessionModal({ workSession, projectName, isOpen, toggle, updateWorkSession }) {
    const [start_time, setStartTime] = useState(workSession.start_time);
    const [stop_time, setStopTime] = useState(workSession.stop_time);
    const [description, setDescription] = useState(workSession.description);

    useEffect(() => {
        // convert start time and stop time to a format that works with the time input field
        // it comes in as "2024-07-17T15:50:58.315+00:00"
        // we want to extract the time portion and convert it to "15:50"
        // "yyyy-MM-ddThh:mm" in local timezone
        const convertedStartTime = moment(workSession.start_time).format('YYYY-MM-DDTHH:mm');
        const convertedStopTime = moment(workSession.stop_time).format('YYYY-MM-DDTHH:mm');



        setStartTime(convertedStartTime);
        setStopTime(convertedStopTime);

    }, [isOpen]);

    const handleUpdate = () => {
        updateWorkSession({
            id: workSession.id,
            start_time: new Date(start_time).toISOString(),
            stop_time: new Date(stop_time).toISOString(),
            description: description
        });
        toggle();
    }

    function updateStartTime(e) {
        setStartTime(moment(e.target.value).format('YYYY-MM-DDTHH:mm'));
    }

    function updateStopTime(e) {
        setStopTime(moment(e.target.value).format('YYYY-MM-DDTHH:mm'));
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Edit Work Session</ModalHeader>
            <ModalBody>
                <h3>{projectName}</h3>
                <Row>
                    <Col>
                    <FormGroup>
                    <Label for="start_time">Start Time</Label>
                    <Input type="datetime-local" name="start_time" id="start_time" value={start_time} onChange={updateStartTime} />
                </FormGroup>
                    </Col>
                    <Col>
                    <FormGroup>
                    <Label for="stop_time">Stop Time</Label>
                    <Input type="datetime-local" name="stop_time" id="stop_time" value={stop_time} onChange={updateStopTime} />
                </FormGroup>
                    </Col>
                </Row>


            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleUpdate}>Update</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );

}