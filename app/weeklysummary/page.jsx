'use client'
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button } from 'reactstrap';
import moment from 'moment';
import WorkSessionCard from '@/components/entry/WorkSessionCard';
import { createClient } from '@/utils/supabase/client';

export default function WeeklyWorkSessions() {
  const supabase = createClient();
  const [selectedWeek, setSelectedWeek] = useState(moment().startOf('week')); // Default to current week
  const [workSessions, setWorkSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchWorkSessions(selectedWeek);
    }
  }, [selectedWeek, projects]);

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

      const filteredSessions = data.filter(session => {
        const elapsedTime = calculateElapsedTime(session.start_time, session.stop_time);
        return elapsedTime >= 0.25;
      });

      const enrichedSessions = filteredSessions.map(session => {
        const project = projects.find(p => p.id === session.project_id);
        return {
          ...session,
          projectName: project ? project.name : 'Unknown Project',
        };
      });

      setWorkSessions(enrichedSessions);
    } catch (error) {
      console.error('Error fetching work sessions:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const renderWorkSessionCards = () => {
    const daysOfWeek = [];
    let currentDate = selectedWeek.clone().startOf('week');

    while (currentDate <= selectedWeek.clone().endOf('week')) {
      daysOfWeek.push(currentDate.clone());
      currentDate.add(1, 'day');
    }

    return daysOfWeek.map((day) => (
      <Col key={day.format('YYYY-MM-DD')} md={6} lg={4} className="mb-4">
        <h4>{day.format('dddd, MMMM Do')}</h4>
        {workSessions
          .filter((session) => moment(session.start_time).isSame(day, 'day'))
          .map((session) => (
            <WorkSessionCard key={session.id} workSession={session} projectName={session.projectName} />
          ))}
      </Col>
    ));
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2>Weekly Work Sessions</h2>
          <Button
            color="primary"
            onClick={() => setSelectedWeek(selectedWeek.clone().subtract(1, 'week'))}
            className="mr-2"
          >
            Previous Week
          </Button>
          <Button color="primary" onClick={() => setSelectedWeek(selectedWeek.clone().add(1, 'week'))}>
            Next Week
          </Button>
        </Col>
      </Row>
      <Row>
        {loading ? (
          <Spinner color="primary" />
        ) : workSessions.length === 0 ? (
          <Col>
            <p>No work sessions found for the selected week.</p>
          </Col>
        ) : (
          renderWorkSessionCards()
        )}
      </Row>
    </Container>
  );
}
