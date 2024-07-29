'use client';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, Card, CardBody, Collapse } from 'reactstrap';
import moment from 'moment';
import WorkSessionCard from '@/components/entry/WorkSessionCard';
import { createClient } from '@/utils/supabase/client';
import { IconCaretLeft, IconCaretRight } from '@tabler/icons-react';

export default function WeeklyWorkSessions() {
	const supabase = createClient();
	const [selectedWeek, setSelectedWeek] = useState(moment().startOf('week')); // Default to current week
	const [workSessions, setWorkSessions] = useState([]);
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedDays, setExpandedDays] = useState({}); // State to track which days are expanded

	useEffect(() => {
		fetchProjects();
	}, []);

	useEffect(() => {
		if (projects.length > 0) {
			fetchWorkSessions(selectedWeek);
		}
	}, [selectedWeek, projects]);

	async function updateWorkSession(workSession) {
		try {
			const { data, error } = await supabase
				.from('worksession')
				.update([{ ...workSession }])
				.eq('id', workSession.id)
				.select();

			if (error) {
				throw error;
			}

			if (data && data.length > 0) {
				fetchWorkSessions(selectedWeek);
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function fetchProjects() {
		try {
			const { data, error } = await supabase.from('projects').select('*');
			if (error) throw error;
			setProjects(data || []);
		} catch (error) {
			console.error('Error fetching projects:', error.message);
		}
	}

	const calculateElapsedTime = (startTime, stopTime) => {
		const start = moment(startTime);
		const stop = moment(stopTime);
		const duration = moment.duration(stop.diff(start));
		const hours = duration.asHours();
		return Math.round(hours * 4) / 4; // Round to nearest 0.25
	};

	async function fetchWorkSessions(weekStart) {
		try {
			setLoading(true);
			const startOfWeek = weekStart.clone().startOf('week').toISOString();
			const endOfWeek = weekStart.clone().endOf('week').toISOString();

			const { data, error } = await supabase
				.from('worksession')
				.select('*')
				.gte('start_time', startOfWeek)
				.lte('start_time', endOfWeek)
				.order('start_time', { ascending: true });

			if (error) throw error;

			const filteredSessions = data.filter((session) => {
				const elapsedTime = calculateElapsedTime(session.start_time, session.stop_time);
				return elapsedTime >= 0.25;
			});

			const enrichedSessions = filteredSessions.map((session) => {
				const project = projects.find((p) => p.id === session.project_id);
				return {
					...session,
					projectName: project ? project.name : 'Unknown Project'
				};
			});

			setWorkSessions(enrichedSessions);
		} catch (error) {
			console.error('Error fetching work sessions:', error.message);
		} finally {
			setLoading(false);
		}
	}

	const toggleDayCollapse = (day) => {
		setExpandedDays((prev) => ({
			...prev,
			[day]: !prev[day]
		}));
	};

	const renderWorkSessionCards = () => {
		const daysOfWeek = [];
		let currentDate = selectedWeek.clone().startOf('week');

		while (currentDate <= selectedWeek.clone().endOf('week')) {
			daysOfWeek.push(currentDate.clone());
			currentDate.add(1, 'day');
		}

		return daysOfWeek.map((day) => {
			const daySessions = workSessions.filter((session) => moment(session.start_time).isSame(day, 'day'));
			const totalHours = daySessions.reduce((total, session) => {
				const elapsedTime = calculateElapsedTime(session.start_time, session.stop_time);
				return total + elapsedTime;
			}, 0);

			const isZeroHours = totalHours === 0;
			const textColor = isZeroHours ? '#808080' : 'black';

			return (
				<div key={day.format('YYYY-MM-DD')} className="mb-1">
					<div
						className="day-header"
						style={{ cursor: isZeroHours ? 'default' : 'pointer', padding: '8px 0' }}
						onClick={() => !isZeroHours && toggleDayCollapse(day.format('YYYY-MM-DD'))}
					>
						<Row>
							<Col xs="auto">
								<h4 className="float-left mb-0" style={{ color: textColor }}>
									{day.format('dddd, MMMM Do')}
								</h4>
							</Col>
							<Col>
								<p className="float-right mb-0" style={{ color: textColor, float: 'right', fontSize: '18px' }}>
									<strong>{totalHours.toFixed(2)} hrs</strong>
								</p>
							</Col>
						</Row>

						<div className="clearfix"></div>
					</div>
					{!isZeroHours && (
						<Collapse isOpen={expandedDays[day.format('YYYY-MM-DD')]}>
							{daySessions.map((session) => (
								<WorkSessionCard key={session.id} workSession={session} updateWorkSession={updateWorkSession} projectName={session.projectName} />
							))}
						</Collapse>
					)}
				</div>
			);
		});
	};

	const calculateWeeklyTotals = () => {
		const totalHours = workSessions.reduce((total, session) => {
			const elapsedTime = calculateElapsedTime(session.start_time, session.stop_time);
			return total + elapsedTime;
		}, 0);

		const billableHours = workSessions.reduce((total, session) => {
			const elapsedTime = calculateElapsedTime(session.start_time, session.stop_time);
			const project = projects.find((p) => p.id === session.project_id);
			if (elapsedTime >= 0.25 && project?.billable) {
				return total + elapsedTime;
			}
			return total;
		}, 0);

		return { totalHours, billableHours };
	};

	const { totalHours, billableHours } = calculateWeeklyTotals();

	// convert the date to a string
	const selectedWeekString = selectedWeek.format('MMMM Do, YYYY');
	const weekStartString = selectedWeek.clone().startOf('week').format('MMMM Do, YYYY');
	const weekEndString = selectedWeek.clone().endOf('week').format('MMMM Do, YYYY');

	return (
		<Container className="mt-3">
			<Row className="mb-4">
				<Col>
					<Row>
						<Col>
							<h2>Week Summary</h2>
						</Col>
					</Row>
					<Row>
						<Col>
							<h5>
								{weekStartString} - {weekEndString}
							</h5>
						</Col>
					</Row>
				</Col>
				<Col xs="12">
					<Row>
						<Col xs="6" sm="auto">
							<Button color="secondary" onClick={() => setSelectedWeek(selectedWeek.clone().subtract(1, 'week'))} style={{ width: '100%', minWidth:"150px" }}>
								<IconCaretLeft />
							</Button>
						</Col>
						<Col xs="6"  sm="auto">
							<Button color="secondary" onClick={() => setSelectedWeek(selectedWeek.clone().add(1, 'week'))} style={{ width: '100%', minWidth:"150px"  }}>
								<IconCaretRight />
							</Button>
						</Col>
					</Row>
				</Col>
			</Row>
			<Row>
				{loading ? (
					<Row>
            <Col
            //center horizontally
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
            >
            <Spinner color="primary" />
            </Col>
            
          </Row>
				) : workSessions.length === 0 ? (
					<Col>
						<p>No work sessions found for the selected week.</p>
					</Col>
				) : (
					<>
						<Col>{renderWorkSessionCards()}</Col>
						<Col md={4} className="mt-2 mt-md-0">
							<Card className='mb-5'>
								<CardBody>
									{/* center this */}
									<h4 style={{ textAlign: 'center' }} className='d-none d-md-block'>Weekly Totals</h4>
									<hr className='d-none d-md-block'></hr>
									<Row>
										<Col>
											<h5 style={{ float: 'right' }}>Total Hours: {totalHours.toFixed(2)}</h5>
										</Col>
									</Row>
									<Row>
										<Col>
											<h5 style={{ float: 'right', color: 'green' }}>Billable Hours: {billableHours.toFixed(2)}</h5>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</>
				)}
			</Row>
		</Container>
	);
}
