'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { createClient } from '@/utils/supabase/client';
import WOSelectEditor from './WOSelectEditor';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { Button } from 'reactstrap';

ModuleRegistry.registerModules([AllCommunityModule]);

const WeeklyPlanner = () => {
	const supabase = createClient();
	const gridRef = useRef();
	const [rowData, setRowData] = useState([]);
	const [user, setUser] = useState(null);
	const [config, setConfig] = useState({});
	const [token, setToken] = useState(null);
	const [vSMWorkOrder, setvSMWorkOrder] = useState([]);

	useEffect(() => {
		getUser();
	}, []);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const response = await fetch('/api/endpoint/auth/token');
				const data = await response.json();
				if (data.token) setToken(data.token);
			} catch (error) {
				console.error('Error fetching token:', error);
			}
		};
		fetchToken();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const { data: plannerData, error } = await supabase.from('planner').select('*');
			if (error) {
				console.error('Supabase fetch error:', error.message);
				return;
			}

			const workOrderIds = plannerData.map((row) => row.sm_wo).filter(Boolean);
			if (workOrderIds.length && token && config?.kartayaEndpointURL) {
				try {
					const workOrders = await getvSMWorkOrder(config.kartayaEndpointURL, workOrderIds);
					const woMap = {};
					workOrders.forEach((wo) => {
						woMap[wo.WorkOrder] = wo.Description;
					});
					const enrichedData = plannerData.map((row) => ({
						...row,
						description: woMap[row.sm_wo] || ''
					}));
					setRowData(enrichedData);
					setvSMWorkOrder(workOrders);
				} catch (error) {
					console.error('Failed to fetch WO descriptions:', error);
					setRowData(plannerData);
				}
			} else {
				setRowData(plannerData);
			}
		};
		fetchData();
	}, [token, config]);

	const getUser = async () => {
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			setUser(user);
			if (user) {
				const { data, error } = await supabase.from('usersettings').select('config').eq('user_id', user.id).single();
				if (error && error.code === 'PGRST116') {
					const { data: newData, error: newError } = await supabase.from('usersettings').insert({ user_id: user.id, config: {} }).select().single();
					if (newError) throw newError;
					setConfig(newData.config);
				} else if (error) {
					throw error;
				} else {
					setConfig(data.config);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getWOGraphQLQuery = () => `
		query GetWOs {
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
		const query = getWOGraphQLQuery();
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ query })
		});
		if (!response.ok) throw new Error('Network response was not ok');
		const json = await response.json();
		return json.data.vSMWorkOrder;
	};

	const workOrderOptions = [...vSMWorkOrder]
		.filter((wo) => wo.WorkOrder <= 10000)
		.sort((a, b) => b.WorkOrder - a.WorkOrder)
		.map((wo) => ({
			value: wo.WorkOrder,
			label: `${wo.WorkOrder} - ${wo.Description}`
		}));

	const colDefs = useMemo(
		() => [
			{ field: 'week_of', headerName: 'Week Of', editable: true },
			{ field: 'override_dev', headerName: 'Person', editable: true },
			{
				field: 'sm_wo',
				headerName: 'SM WO',
				editable: true,
				flex: 2,
				cellEditor: 'agSelectCellEditor',
				cellEditorParams: {
					values: workOrderOptions.map((wo) => wo.value),
				}
			},
			{ field: 'plan_hours', headerName: 'Plan Hours', editable: true, cellClass: 'ag-right-aligned-cell' },
			{ field: 'revised_hours', headerName: 'Revised Hours', editable: true, cellClass: 'ag-right-aligned-cell' },
			{ field: 'override_rate', headerName: 'Override Rate', editable: true },
			{ field: 'override_at_risk', headerName: 'At Risk', editable: true }
		],
		[workOrderOptions]
	);

	const defaultColDef = {
		sortable: true,
		filter: true,
		resizable: true,
		flex: 1
	};

  const handleCellEdit = async (event) => {
    console.log('Cell edited:', event.colDef.field, event.newValue); // Log event
  
    updateRowDataOnCellEdit(event); // Call the function to update row data

    // Your code for updating the row
    var updatedRow = { ...event.data };
  
    if (event.colDef.field === 'sm_wo') {
      const match = vSMWorkOrder.find((wo) => wo.WorkOrder === event.newValue);
      if (match) {
        updatedRow.description = match.Description;
        event.api.applyTransaction({ update: [updatedRow] });
        setRowData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? { ...row, description: match.Description } : row)));
      }
    }
  
    if (updatedRow.id) {
      //remove description from updatedRow before sending to supabase
      const { description, ...rest } = updatedRow;
      updatedRow = rest;
      const { error } = await supabase.from('planner').update(updatedRow).eq('id', updatedRow.id);
      if (error) {
        console.error('Supabase update error:', error.message);
      }
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
		if (error) {
			console.error('Supabase insert error:', error.message);
			return;
		}
		setRowData((prev) => [...prev, data]);
	};

	const handleDeleteRow = async () => {
		const selectedNodes = gridRef.current.api.getSelectedNodes();
		const selectedIds = selectedNodes.map((node) => node.data.id);
		if (selectedIds.length === 0) return;

		const { error } = await supabase.from('planner').delete().in('id', selectedIds);
		if (error) {
			console.error('Supabase delete error:', error.message);
			return;
		}
		setRowData((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
	};

  function updateRowDataOnCellEdit(event) {
    const updatedRow = { ...event.data };
    if (event.colDef.field === 'sm_wo') {
      const match = vSMWorkOrder.find((wo) => wo.WorkOrder === event.newValue);
      if (match) {
        updatedRow.description = match.Description;
        event.api.applyTransaction({ update: [updatedRow] });
        setRowData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? { ...row, description: match.Description } : row)));
      }
    }
  }

	return (
		<div>
			<div className="p-3">
				<Button color="primary" onClick={handleAddRow}>
					Add Row
				</Button>
				<Button onClick={handleDeleteRow} style={{ marginLeft: 10 }}>
					Delete Selected
				</Button>
			</div>
			<div className="ag-theme-balham" style={{ height: 600, width: '100%' }}>
				<AgGridReact
					ref={gridRef}
					rowData={rowData}
					columnDefs={colDefs}
					defaultColDef={defaultColDef}
					rowSelection="multiple"
					onCellEditingStarted={(e) => console.log('Editing started', e)}
					onCellEditingStopped={(e) => {
            console.log('Editing stopped', e)
          }}
					onCellValueChanged={handleCellEdit} // Ensure this is properly linked
				/>
			</div>
			<pre>{JSON.stringify(rowData, null, 2)}</pre>
		</div>
	);
};

export default WeeklyPlanner;
