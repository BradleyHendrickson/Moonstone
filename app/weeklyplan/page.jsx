'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { createClient } from '@/utils/supabase/client';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { Button } from 'reactstrap';
import WOSelectEditor from './WOSelectEditor';

ModuleRegistry.registerModules([AllCommunityModule]);

const WeeklyPlanner = () => {
	const supabase = createClient();
	const gridRef = useRef();
	const [rowData, setRowData] = useState([]);
	const [user, setUser] = useState(null);
	const [config, setConfig] = useState({});
	const [token, setToken] = useState(null);
	const [vSMWorkOrder, setvSMWorkOrder] = useState([]);

	// Load user and config
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				const { data, error } = await supabase
					.from('usersettings')
					.select('config')
					.eq('user_id', user.id)
					.single();

				if (error?.code === 'PGRST116') {
					const { data: newData } = await supabase
						.from('usersettings')
						.insert({ user_id: user.id, config: {} })
						.select()
						.single();
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

	// Load planner data and enrich with descriptions
	useEffect(() => {
		const fetchPlannerData = async () => {
			const { data: plannerData, error } = await supabase.from('planner').select('*');
			if (error) return console.error('Supabase fetch error:', error.message);

			const workOrderIds = plannerData.map((r) => r.sm_wo).filter(Boolean);
			if (workOrderIds.length && token && config?.kartayaEndpointURL) {
				try {
					const workOrders = await getvSMWorkOrder(config.kartayaEndpointURL);
					const woMap = Object.fromEntries(workOrders.map((wo) => [wo.WorkOrder, wo.Description]));
					setvSMWorkOrder(workOrders);

					const enriched = plannerData.map((row) => ({
						...row,
						description: woMap[row.sm_wo] || ''
					}));
					setRowData(enriched);
				} catch (error) {
					console.error('Failed to enrich planner data:', error);
					setRowData(plannerData);
				}
			} else {
				setRowData(plannerData);
			}
		};

		if (token && config) fetchPlannerData();
	}, [token, config]);

	const getWOGraphQLQuery = () => `
		query {
			vSMWorkOrder(where: {SMCo: {_eq: "1"}, WOStatus: {_eq: 0}}) {
				SMCo
				WorkOrder
				Description
				WOStatus
				LeadTechnician
				CustGroup
				Customer
			}
		}
	`;

	const getvSMWorkOrder = async (endpoint) => {
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

		const updatedRow = { ...row };
		//update rowData with new values by id
		if (updatedRow.id) {
			const { description, ...rest } = updatedRow;
			const { error } = await supabase.from('planner').update(rest).eq('id', updatedRow.id);
			if (error) console.error('Supabase update error:', error.message);

			setRowData((prevData) =>
				prevData.map((row) => (row.id === updatedRow.id ? { ...row, ...updatedRow } : row))
			);
		}
		
	};

	const colDefs = useMemo(() => {
		return [
			{ field: 'week_of', headerName: 'Week Of', editable: true },
			{ field: 'override_dev', headerName: 'Person', editable: true },
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
			{ field: 'plan_hours', headerName: 'Plan Hours', editable: true, cellClass: 'ag-right-aligned-cell' },
			{ field: 'revised_hours', headerName: 'Revised Hours', editable: true, cellClass: 'ag-right-aligned-cell' },
			{ field: 'override_rate', headerName: 'Override Rate', editable: true },
			{ field: 'override_at_risk', headerName: 'At Risk', editable: true }
		];
	}, [workOrderOptions]);
	
	const defaultColDef = {
		sortable: true,
		filter: true,
		resizable: true,
		flex: 1
	};

	const handleCellEdit = async (event) => {
		console.log('Cell edited:', event);
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
			const { description, ...rest } = updatedRow;
			const { error } = await supabase.from('planner').update(rest).eq('id', updatedRow.id);
			if (error) console.error('Supabase update error:', error.message);

			setRowData((prevData) =>
				prevData.map((row) => (row.id === updatedRow.id ? { ...row, ...updatedRow } : row))
			);
		}
	};

	const handleAddRow = async () => {
		const newRow = {
			week_of: new Date().toISOString().split('T')[0],
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

	return (
		<div>
			<div className="p-3">
				<Button color="primary" onClick={handleAddRow}>Add Row</Button>
				<Button onClick={handleDeleteRow} style={{ marginLeft: 10 }}>Delete Selected</Button>
			</div>
			<div className="ag-theme-balham" style={{ height: 600, width: '100%' }}>
				<AgGridReact
					ref={gridRef}
					rowData={rowData}
					columnDefs={colDefs}
					defaultColDef={defaultColDef}
					rowSelection="multiple"
					components={{
						WOSelectEditor
					  }}
					onCellValueChanged={handleCellEdit}
				/>
			</div>
			<pre>{JSON.stringify(rowData, null, 2)}</pre>
		</div>
	);
};

export default WeeklyPlanner;
