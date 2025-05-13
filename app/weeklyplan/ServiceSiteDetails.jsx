import React from 'react';
import { Row, Col } from 'reactstrap';
const ServiceSiteDetails = ({ linkedServiceSite }) => {
	if (!linkedServiceSite) {
		return <p>No service site data available.</p>;
	}

	const { Description: siteDescription, RateTemplate, linkedRateTemplate } = linkedServiceSite;

	return (
		<div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
			<p>
				<strong>Service Site:</strong> {siteDescription}
			</p>

			{linkedRateTemplate && (
				<Row>
					<Col>
						<p>{linkedRateTemplate.Description} - <strong>Labor Rate:</strong> ${linkedRateTemplate.LaborRate.toFixed(2)}/hr</p>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default ServiceSiteDetails;
