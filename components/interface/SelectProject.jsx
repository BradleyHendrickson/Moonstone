import React, { useEffect, useState } from 'react';
import { FormGroup, Label } from 'reactstrap';
import Select from 'react-select';

const SelectProject = ({ supabase, value, onChange }) => {
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [initialProjectLoad, setInitialProjectLoad] = useState(true);

    useEffect(() => {
        getProjects();
    }, []);

    useEffect(() => {
        if (initialProjectLoad && projects.length > 0) {
            setSelectedProject(projects[0]);
        }
    }, [initialProjectLoad, projects]);

    async function getProjects() {
        try {
            setLoadingProjects(true);

            let { data, error, status } = await supabase
                .from('projects')
                .select(`id, created_at, name, description, status, user_id, billable, seq, hidden`);

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setProjects(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setInitialProjectLoad(false);
            setLoadingProjects(false);
        }
    }

    const projectSelections = projects.map(project => ({
        value: project,
        label: project.name
    }));
    

    return (
        <FormGroup>
            <Label for="project">Project</Label>
            <Select
                options={projectSelections}
                onChange={onChange}
                value={value}
                isClearable
                isLoading={loadingProjects}
            />
        </FormGroup>
    );

};

export default SelectProject;
