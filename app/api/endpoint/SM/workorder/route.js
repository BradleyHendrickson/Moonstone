
import { NextResponse } from 'next/server'
import axios from 'axios'
import { getUserSettings } from '@/app/server/auth/endpoint/getUserSettings'

export async function GET() {
	try {
		const settings = await getUserSettings()
		console.log('User settings:', settings)
		const token = settings.kartayaEndpointClientSecret
		const response = await axios.post(
			'https://c001-silvertrek.endpoint.azure.kartaya.com/v1/graphql',
			{
				query: `
					query GetExistingWO {
						vSMWorkOrder {
							SMCo
							WorkOrder
							Description
						}
					}
				`
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}
		)

		return NextResponse.json(response.data)
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: 'Failed to fetch work orders' },
			{ status: 500 }
		)
	}
}
