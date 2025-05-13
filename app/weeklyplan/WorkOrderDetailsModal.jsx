import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Collapse,
  Button,
  Card,
  CardHeader,
  CardBody
} from 'reactstrap';
import ServiceSiteDetails from './ServiceSiteDetails';
const WorkOrderDetailsModal = ({ isOpen, toggle, data, defaultExpandedScope }) => {
  if (!data) return null;

  const {
    WorkOrder,
    Description,
    LeadTechnician,
    WOStatus,
    linkedWorkOrderScopes = []
  } = data;

  // Calculate total planned and actual labor hours
  const totalPlannedHours = linkedWorkOrderScopes.reduce((sum, scope) => sum + (scope.LaborHours || 0), 0);
  const totalActualHours = linkedWorkOrderScopes.reduce((sum, scope) => {
    const scopeActual = scope.linkedWorkCompletedLabor?.reduce((s, entry) => s + (entry.CostQuantity || 0), 0) || 0;
    return sum + scopeActual;
  }, 0);

  // Determine status text and class
  const statusInfo = (() => {
    switch (WOStatus) {
      case 0:
        return { text: 'Open', className: 'text-success' };
      case 1:
        return { text: 'In Progress', className: 'text-warning' };
      case 2:
        return { text: 'Closed', className: 'text-secondary' };
      default:
        return { text: 'Unknown Status', className: 'text-danger' };
    }
  })();

  // State to manage which scopes are expanded
  const [expandedScopes, setExpandedScopes] = useState(() => {
    if (defaultExpandedScope !== undefined) {
      return { [defaultExpandedScope]: true };
    }
    return {};
  });

  const toggleScope = (scopeId) => {
    setExpandedScopes((prev) => ({
      ...prev,
      [scopeId]: !prev[scopeId]
    }));
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>
        Work Order {WorkOrder} - {Description}
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <p><strong>Lead Technician:</strong> {LeadTechnician}</p>
          <p><strong>Status:</strong> <span className={statusInfo.className}>{statusInfo.text}</span></p>
		  <ServiceSiteDetails linkedServiceSite={data.linkedServiceSite} />
		</div>


        {linkedWorkOrderScopes.map((scope) => {
          const actualHours = scope.linkedWorkCompletedLabor?.reduce((sum, entry) => sum + (entry.CostQuantity || 0), 0) || 0;
          const isOpen = expandedScopes[scope.Scope] || false;

          return (
            <Card key={scope.Scope} className="mb-4">
              <CardHeader>
                <Row>
                  <Col md="8">
                    <Button color="link" onClick={() => toggleScope(scope.Scope)}>
                      {isOpen ? '▼' : '▶'}{scope.Scope}: {scope.Description}
                    </Button>
                  </Col>
                  <Col md="2" className="text-right">
                    <strong>Planned:</strong> {scope.LaborHours?.toFixed(2) || '0.00'}
                  </Col>
				  <Col md="2" className="text-right">
				  	<strong>Actual:</strong> {actualHours.toFixed(2)}
				  </Col>
                </Row>
              </CardHeader>
              <Collapse isOpen={isOpen}>
                <CardBody>
                  <Row className="mb-2">
                    <Col><strong>Price Method:</strong> {scope.PriceMethod}</Col>
                  </Row>

                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Employee</th>
                        <th style={{ textAlign: 'left' }}>Date</th>
                        <th style={{ textAlign: 'right' }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scope.linkedWorkCompletedLabor?.map((entry, index) => (
                        <tr key={index}>
                          <td style={{ textAlign: 'left' }}>{entry.PREmployee || 'N/A'}</td>
                          <td style={{ textAlign: 'left' }}>{entry.Date ? new Date(entry.Date).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ textAlign: 'right' }}>{(entry.CostQuantity || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="1" style={{ textAlign: 'right' }}><strong>Totals:</strong></td>
						<td colSpan="1" style={{ textAlign: 'right' }}><strong>Planned: {scope.LaborHours?.toFixed(2) || '0.00'}</strong></td>
                        <td style={{ textAlign: 'right' }}><strong>Actual: {actualHours.toFixed(2)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </CardBody>
              </Collapse>
            </Card>
          );
        })}

        <div className="mt-4 mb-5">
          
          <Row>
			<Col md="8"><h5>Summary</h5></Col>
            <Col md="2"><strong>Planned:</strong> {totalPlannedHours.toFixed(2)}</Col>
            <Col md="2"><strong>Actual:</strong> {totalActualHours.toFixed(2)}</Col>
          </Row>
        </div>
		{/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
      </ModalBody>
    </Modal>
  );
};

export default WorkOrderDetailsModal;
