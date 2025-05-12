'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { createClient } from '@/utils/supabase/client';
import { Button, FormGroup, Input, InputGroup, Modal, ModalHeader, ModalBody, Row, Col, Collapse, Card, CardHeader, CardBody } from 'reactstrap';
import WOSelectEditor from './WOSelectEditor';
import UserSelectEditor from './UserSelectEditor';
import WorkOrderDetailsModal from './WorkOrderDetailsModal';
import DetailsButtonRenderer from './DetailsButtonRenderer';
import { themeAlpine } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const WeeklyPlanner = () => {
	const supabase = createClient();
	const gridRef = useRef();
	const [rowData, setRowData] = useState([]);
	const [user, setUser] = useState(null);
	const [config, setConfig] = useState({});
	const [token, setToken] = useState(null);
	const [vSMWorkOrder, setvSMWorkOrder] = useState([]);
	const [detailsModalOpen, setDetailsModalOpen] = useState(false);
	const [selectedDetails, setSelectedDetails] = useState(null);
	const [rowSaving, setRowSaving] = useState(false);
	const [userList, setUserList] = useState([]);
	const [include_closed, setIncludeClosed] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const toggleSettings = () => setSettingsOpen(!settingsOpen);
	const getMondayOfCurrentWeek = () => {
		const today = new Date();
		const day = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
		const diff = day === 0 ? -6 : 1 - day; // if Sunday, backtrack 6 days; otherwise subtract (day - 1)
		const monday = new Date(today);
		monday.setUTCDate(today.getUTCDate() + diff);
		return monday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
	};

	const [weekOf, setWeekOf] = useState(getMondayOfCurrentWeek());

	const toggleDetailsModal = () => setDetailsModalOpen(!detailsModalOpen);
	const handleShowDetails = (row) => {
		const wo = vSMWorkOrder.find((wo) => `${wo.WorkOrder}` === `${row.sm_wo}`);
		if (wo) {
			setSelectedDetails(wo);
			setDetailsModalOpen(true);
		}
	};
	// Load user and config
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				const { data, error } = await supabase.from('usersettings').select('config').eq('user_id', user.id).single();

				if (error?.code === 'PGRST116') {
					const { data: newData } = await supabase.from('usersettings').insert({ user_id: user.id, config: {} }).select().single();
					setConfig(newData.config);
				} else if (!error) {
					setConfig(data.config);
				}
			}
		};

		const fetchToken = async () => {
			const response = await fetch('/api/endpoint/auth/token');
			const { token } = await response.json();
			if (token) setToken(token);
		};

		loadUser();
		fetchToken();
	}, []);

	const fetchPlannerData = async () => {
		if (!weekOf) return;

		// Fetch planner data for the given week_of value
		const { data: plannerData, error } = await supabase.from('planner').select('*').eq('week_of', weekOf);

		//console.log('fetching planner data for week:', weekOf);

		if (error) {
			console.error('Supabase fetch error:', error.message);
			return;
		}

		const workOrderIds = plannerData.map((r) => r.sm_wo).filter(Boolean);
		if (workOrderIds.length && token && config?.kartayaEndpointURL) {
			try {
				const workOrders = await getvSMWorkOrder(config.kartayaEndpointURL);
				const woMap = Object.fromEntries(workOrders.map((wo) => [wo.WorkOrder, wo.Description]));
				setvSMWorkOrder(workOrders);
				console.log('Fetched work orders:', workOrders);

				const enriched = plannerData.map((row) => {
					const matchingWorkOrder = workOrders.find((wo) => wo.WorkOrder.toString() === row.sm_wo);
					const matchingScope = matchingWorkOrder?.linkedWorkOrderScopes?.find((scope) => scope.Scope === row.scope);

					const laborRate = matchingWorkOrder?.linkedServiceSite?.linkedRateTemplate?.LaborRate || 0;
					const estimatedHours = matchingScope?.LaborHours || 0;
					const laborHours = matchingScope?.linkedWorkCompletedLabor?.reduce((acc, labor) => acc + labor.CostQuantity, 0) || 0;
					const totalHours = row.plan_hours;
					const atRisk = laborHours + totalHours > estimatedHours;

					return {
						...row,
						rate: laborRate,
						planned_revenue: !atRisk ? row.plan_hours * laborRate : 0,
						projected_revenue: !atRisk ? row.revised_hours * laborRate : 0,
						at_risk: atRisk ? 'Yes' : 'No'
					};
				});
				setRowData(enriched);
			} catch (error) {
				console.error('Failed to enrich planner data:', error);
				setRowData(plannerData);
			}
		} else {
			setRowData(plannerData);
		}
	};

	// Load planner data and enrich with descriptions
	useEffect(() => {
		const fetchUserList = async () => {
			const { data, error } = await supabase.from('planner_users').select('*').order('name', { ascending: true });
			if (error) {
				console.error('Error fetching user list:', error.message);
				return;
			}
			const userList = data.map((user) => ({
				value: user.id,
				label: user.name
			}));
			setUserList(userList);
		};

		if (token && config) {
			fetchUserList();
			fetchPlannerData();
		}
	}, [token, config, weekOf]);

	const getWOGraphQLQuery = () => `
		query {
			vSMWorkOrder(where: {SMCo: {_eq: "1"}, ${include_closed ? 'WOStatus: {_in: [0, 1, 2]}' : 'WOStatus: {_eq: 0}'}}) {
				SMCo
				WorkOrder
				Description
				WOStatus
				LeadTechnician
				CustGroup
				Customer
				linkedWorkOrderScopes {
					Scope
					Description
					PriceMethod
					LaborHours
					Price
					linkedWorkCompletedLabor {
						PREmployee
						Description
						Date
						CostQuantity
					}
				}
				linkedServiceSite {
					Description
					RateTemplate
					linkedRateTemplate {
						Description
						LaborRate
					}
				}
			}
		}
	`;

	const getvSMWorkOrder = async (endpoint) => {
		console.log('Fetching work orders from endpoint:', endpoint);
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ query: getWOGraphQLQuery() })
		});
		if (!response.ok) throw new Error('Failed to fetch work orders');
		const json = await response.json();
		console.log('Fetched work orders:', json);
		return json.data.vSMWorkOrder;
	};

	const workOrderOptions = useMemo(() => {
		return vSMWorkOrder
			.filter((wo) => wo.WorkOrder <= 10000)
			.sort((a, b) => b.WorkOrder - a.WorkOrder)
			.map((wo) => ({
				value: `${wo.WorkOrder}`,
				label: `${wo.WorkOrder} - ${wo.Description}`
			}));
	}, [vSMWorkOrder]);

	async function updateRow(row) {
		if (!row) return;

		setRowSaving(true); // start saving

		const supabase_columns = [
			'id',
			'week_of',
			'sm_co',
			'sm_wo',
			'plan_hours',
			'revised_hours',
			'user_id',
			'override_dev',
			'override_rate',
			'override_at_risk',
			'scope',
			'planner_user'
		];

		const updatedRow = { ...row };

		if (updatedRow.id) {
			// Filter to only allowed columns
			const filteredUpdate = Object.fromEntries(Object.entries(updatedRow).filter(([key]) => supabase_columns.includes(key)));

			if (updatedRow.scope) {
				updatedRow.scope = parseInt(updatedRow.scope, 10);
			}

			const { error } = await supabase.from('planner').update(filteredUpdate).eq('id', updatedRow.id);

			if (error) console.error('Supabase update error:', error.message);

			setRowData((prevData) => prevData.map((r) => (r.id === updatedRow.id ? { ...r, ...updatedRow } : r)));
		}

		setRowSaving(false); // done saving
	}

	const calculatedColumnStyle = {
		backgroundColor: '#f0f0f0',
		color: '#333333'
	};
	const colDefs = useMemo(() => {
		return [
			{
				field: 'planner_user',
				headerName: 'Person',
				editable: true,
				cellEditor: UserSelectEditor,
				cellEditorParams: {
					values: userList, // This must match what the editor expects
					updateRow: updateRow
				},
				valueFormatter: (params) => {
					const user = userList.find((user) => `${user.value}` === `${params.value}`);
					return user ? user.label : params.value;
				}
			},
			{
				field: 'sm_wo',
				headerName: 'SM WO',
				editable: true,
				flex: 2,
				cellEditor: 'WOSelectEditor',
				cellEditorParams: {
					values: workOrderOptions, // This must match what the editor expects
					updateRow: updateRow
				},
				valueFormatter: (params) => {
					const wo = vSMWorkOrder.find((wo) => `${wo.WorkOrder}` === `${params.value}`);
					return wo ? `${wo.WorkOrder} - ${wo.Description}` : params.value;
				}
			},
			{
				field: 'scope',
				headerName: 'Scope',
				editable: true,
				cellEditor: 'agSelectCellEditor',
				cellEditorParams: (params) => {
					const wo = vSMWorkOrder.find((wo) => `${wo.WorkOrder}` === `${params.data.sm_wo}`);
					return {
						values: wo ? wo.linkedWorkOrderScopes.map((scope) => scope.Scope) : [],
						updateRow: updateRow
					};
				},
				valueFormatter: (params) => {
					//console.log('params', params);
					const wo = vSMWorkOrder.find((wo) => `${wo.WorkOrder}` === `${params?.data?.sm_wo}`);
					const scope = wo?.linkedWorkOrderScopes.find((scope) => scope.Scope === params.value);
					// if no work order, return the value
					if (!wo) return params.value;
					return scope ? `${scope.Scope} - ${scope.Description}` : params.value;
				}
			},
			{
				field: 'details',
				headerName: 'Details',
				editable: false,
				cellRenderer: 'detailsButtonRenderer',
				cellRendererParams: {
					onShowDetails: handleShowDetails
				},
				flex: 0.5	,
			},
			{ field: 'at_risk', headerName: 'At Risk', editable: false, flex: 0.6 },
			{ field: 'plan_hours', headerName: 'Plan Hours', editable: true, cellClass: 'ag-right-aligned-cell', flex: 0.85 },
			{ field: 'revised_hours', headerName: 'Revised Hours', editable: true, cellClass: 'ag-right-aligned-cell', flex: 0.85 },
			{ field: 'rate', headerName: 'Rate', editable: false, cellClass: 'ag-right-aligned-cell', flex: 0.5 },
			{ field: 'planned_revenue', headerName: 'Planned Revenue', editable: false, cellClass: 'ag-right-aligned-cell' },
			{ field: 'projected_revenue', headerName: 'Projected Revenue', editable: false, cellClass: 'ag-right-aligned-cell' }
		];
	}, [workOrderOptions]);

	const defaultColDef = {
		sortable: true,
		filter: true,
		resizable: true,
		flex: 1
	};

	const handleCellEdit = async (event) => {
		//console.log('Cell edited:', event);
		const { colDef, newValue, data } = event;
		let updatedRow = { ...data };

		if (colDef.field === 'sm_wo') {
			const match = vSMWorkOrder.find((wo) => wo.WorkOrder === newValue);
			if (match) {
				updatedRow.description = match.Description;
				event.api.applyTransaction({ update: [updatedRow] });
			}
		}

		if (updatedRow.id) {
			setRowSaving(true); // Start saving indicator

			const supabase_columns = [
				'id',
				'week_of',
				'sm_co',
				'sm_wo',
				'plan_hours',
				'revised_hours',
				'user_id',
				'override_dev',
				'override_rate',
				'override_at_risk',
				'scope',
				'planner_user'
			];

			// cast scope to int
			if (updatedRow.scope) {
				updatedRow.scope = parseInt(updatedRow.scope, 10);
			}

			const filteredUpdate = Object.fromEntries(Object.entries(updatedRow).filter(([key]) => supabase_columns.includes(key)));

			try {
				const { error } = await supabase.from('planner').update(filteredUpdate).eq('id', updatedRow.id);

				if (error) console.error('Supabase update error:', error.message);
			} catch (err) {
				console.error('Unexpected update error:', err);
			} finally {
				setRowSaving(false); // Done saving
			}

			// calculate at_risk, planned_revenue, projected_revenue and set it on updatedRow
			const workOrder = vSMWorkOrder.find((wo) => `${wo.WorkOrder}` === `${updatedRow.sm_wo}`);
			const matchingScope = workOrder?.linkedWorkOrderScopes?.find((scope) => scope.Scope === updatedRow.scope);
			const laborRate = workOrder?.linkedServiceSite?.linkedRateTemplate?.LaborRate || 0;
			const estimatedHours = matchingScope?.LaborHours || 0;
			const laborHours = matchingScope?.linkedWorkCompletedLabor?.reduce((acc, labor) => acc + labor.CostQuantity, 0) || 0;
			const totalHours = updatedRow.plan_hours;
			const atRisk = laborHours + totalHours > estimatedHours;
			updatedRow.at_risk = atRisk ? 'Yes' : 'No';
			updatedRow.planned_revenue = !atRisk ? updatedRow.plan_hours * laborRate : 0;
			updatedRow.projected_revenue = !atRisk ? updatedRow.revised_hours * laborRate : 0;

			setRowData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? { ...row, ...updatedRow } : row)));
		}
	};

	const handleAddRow = async () => {
		const newRow = {
			week_of: weekOf,
			sm_co: null,
			sm_wo: '',
			plan_hours: 0,
			revised_hours: 0,
			override_dev: '',
			override_rate: 0,
			override_at_risk: false
		};

		const { data, error } = await supabase.from('planner').insert(newRow).select().single();
		if (error) return console.error('Insert error:', error.message);
		setRowData((prev) => [...prev, data]);
	};

	const handleDeleteRow = async () => {
		const selectedNodes = gridRef.current.api.getSelectedNodes();
		const selectedIds = selectedNodes.map((node) => node.data.id);
		if (!selectedIds.length) return;

		const { error } = await supabase.from('planner').delete().in('id', selectedIds);
		if (error) return console.error('Delete error:', error.message);

		setRowData((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
	};

	const changeSize = useCallback((value) => {
		document.documentElement.style.setProperty('--ag-spacing', `${value}px`);
		document.getElementById('spacing').innerText = value.toFixed(1);
	}, []);

	const totalRow = {
		//plan_hours: //rowData.reduce((sum, r) => sum + (r.plan_hours || 0), 0),
		//revised_hours: rowData.reduce((sum, r) => sum + (r.revised_hours || 0), 0),
		planned_revenue: rowData.reduce((sum, r) => sum + (r.planned_revenue || 0), 0),
		projected_revenue: rowData.reduce((sum, r) => sum + (r.projected_revenue || 0), 0)
		//at_risk: '' // optional: leave blank or summarize
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
			<Row className="mb-3 p-3">
				<Col xs="auto">
					<span className="fw-bold me-2">Week of:</span>
					<input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} />
				</Col>
				<Col>
					<FormGroup check inline className="mb-0">
						<Input
							type="checkbox"
							id="include_closed"
							checked={include_closed}
							onChange={(e) => setIncludeClosed(e.target.checked)}
							className="me-1"
						/>
						<label htmlFor="include_closed" className="form-check-label">
							Include Closed
						</label>
					</FormGroup>
				</Col>
			</Row>
	
			<Row className="align-items-center mb-3 p-2">
				<Col>
					<h3 className="mb-0">
						{weekOf ? `Weekly Planner for ${new Date(weekOf).toLocaleDateString(undefined, { timeZone: 'UTC' })}` : 'Weekly Planner'}
					</h3>
					<div>{rowSaving ? <div className="mt-0 mb-2">Saving changes...</div> : <div>Up to date.</div>}</div>
				</Col>
				<Col className="d-flex justify-content-end align-items-center">
					<Button color="primary" onClick={handleAddRow} className="me-2">
						Add Row
					</Button>
					<Button onClick={handleDeleteRow} className="me-3">
						Delete Selected
					</Button>
				</Col>
			</Row>
	
			<div style={{ flex: 1, padding: '0 10px' }}>
				<div className="ag-theme-balham" style={{ height: '100%', width: '100%' }}>
					<AgGridReact
						ref={gridRef}
						rowData={rowData}
						columnDefs={colDefs}
						defaultColDef={defaultColDef}
						theme={themeAlpine}
						spacing={'2px'}
						rowSelection="multiple"
						components={{
							WOSelectEditor,
							UserSelectEditor,
							detailsButtonRenderer: DetailsButtonRenderer
						}}
						onCellValueChanged={handleCellEdit}
						pinnedBottomRowData={[totalRow]}
					/>
				</div>
			</div>
	
			<WorkOrderDetailsModal isOpen={detailsModalOpen} toggle={toggleDetailsModal} data={selectedDetails} />
		</div>
	);
	
};

export default WeeklyPlanner;
