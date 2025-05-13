import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const PlannerSummaryTable = ({ rowData, userList, weekOf }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Toggle Modal
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  // Group and aggregate the data by person
  const aggregatedData = rowData.reduce((acc, row) => {
    const existingPerson = acc.find((item) => item.planner_user === row.planner_user);
    if (existingPerson) {
      // Aggregate the totals
      existingPerson.plan_hours += row.plan_hours;
      existingPerson.planned_revenue += row.planned_revenue;
    } else {
      // Add new person to the accumulator
      acc.push({
        planner_user: row.planner_user,
        plan_hours: row.plan_hours,
        planned_revenue: row.planned_revenue
      });
    }
    return acc;
  }, []);

  // Add person name from userList
  const gridData = aggregatedData.map((row) => {
    const personName = userList.find((user) => user.value === row.planner_user)?.label || row.planner_user;
    return { ...row, person_name: personName };
  });

  // Column definitions for AG Grid
  const columnDefs = [
    {
      headerName: 'Person',
      field: 'person_name',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Total Planned Hours',
      field: 'plan_hours',
      cellClass: 'ag-right-aligned-cell',
      sortable: true,
      filter: true
    },
    {
      headerName: 'Total Planned Revenue',
      field: 'planned_revenue',
      cellClass: 'ag-right-aligned-cell',
      sortable: true,
      filter: true
    }
  ];

  return (
    <>
      <Button color="warning" onClick={toggleModal} className='ms-2'>
        Summary by Person
      </Button>

      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>Summary by Person, Week of {new Date(weekOf).toLocaleDateString(undefined, { timeZone: 'UTC' })}</ModalHeader>
        <ModalBody>
          <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={gridData}
              defaultColDef={{
                flex: 1,
                resizable: true
              }}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PlannerSummaryTable;
