import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, CardText, Row, Col } from 'reactstrap';
import moment from 'moment'; // Ensure moment.js is installed
import { IconPencil } from '@tabler/icons-react';
import EditWorkSessionModal from './EditWorkSessionModal';
import { poppins } from '@/utils/fonts';

  

const WorkSessionCard = ({ workSession, projectName, updateWorkSession }) => {
    const formatTime = (time) => {
        return moment(time).format('hh:mm A');
    }

    const calculateElapsedTime = (startTime, stopTime) => {
        const start = moment(startTime);
        const stop = moment(stopTime);
        const duration = moment.duration(stop.diff(start));
        const hours = duration.asHours();
        return Math.round(hours * 4) / 4; // Round to nearest 0.25
    }

    const formattedStartTime = formatTime(workSession.start_time);
    const formattedStopTime = formatTime(workSession.stop_time);
    const elapsedTime = calculateElapsedTime(workSession.start_time, workSession.stop_time);

    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const toggle = () => {
        setIsOpen(!isOpen)
        setIsHovered(false);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    return (
        <div key={workSession.id} style={{marginTop: "0.5rem"}} className={poppins.className}>
            <CardBody onClick={toggle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={isHovered ? { backgroundColor: '#F0F0F0', textDecoration: 'underline' } : {}}>
                <Row>
                    <Col className="text-truncate">
                        <CardTitle tag="h6" className="text-truncate">{projectName}</CardTitle>
                    </Col>

                    <Col xs="auto">
                        <CardText style={{ float: "right" }}>
                            <strong>{elapsedTime.toFixed(2)} hrs</strong>
                            {isHovered && (
                                <>
                                    <IconPencil size={20} style={{ marginLeft: 5, cursor: 'pointer' }} />
                                    <strong style={{ textDecoration: 'underline', marginLeft: 5 }}>edit</strong>
                                </>
                            )}
                        </CardText>
                    </Col>
                </Row>
                <EditWorkSessionModal projectName={projectName} updateWorkSession={updateWorkSession} workSession={workSession} isOpen={isOpen} toggle={toggle}/>
            </CardBody>
        </div>
    );
}

export default WorkSessionCard;
