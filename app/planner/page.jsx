'use client'
import { useEffect, useState } from 'react'

export default function Planner() {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch('/api/endpoint/SM/workorder')
				const json = await res.json()
				if (json.data?.vSMWorkOrder) {
					setData(json.data.vSMWorkOrder)
				} else {
					setError('No data found')
				}
			} catch (err) {
				setError('Failed to load work orders')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	if (loading) return <p>Loading...</p>
	if (error) return <p>Error: {error}</p>

	return (
		<div>
			<h1>Work Orders</h1>
			<ul>
				{data.map((wo, index) => (
					<li key={index}>
						{wo.SMCo} - {wo.WorkOrder} - {wo.Description}
					</li>
				))}
			</ul>
		</div>
	)
}
