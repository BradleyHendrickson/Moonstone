'use server';
import Image from 'next/image';
import './globals.css';
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import logoBlackSvg from '/public/logo_black.svg';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
export default async function Index() {
	const supabase = createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

  let { data, error } = await supabase
  .rpc('get_worksession_count')
  if (error) console.error(error)
  else console.log(data)

	return (
		<Container>
			<Row
				//center the contents
				className="justify-content-center"
			>
				<Col xs="auto">
					<h2 className="mt-5">Welcome to Moonstone.</h2>
					{user ? (
						<h5>
							Simple time tracking that stays out of your way.{' '}
						</h5>
					) : (
						<h5>Create an account to begin tracking your project time!</h5>
            
					)}
          <ul>
            <li><Link href="/tracker">Time Tracker</Link>: record what you work on</li>
            <li><Link href="/weeklysummary">Weekly Summary</Link>: see what you worked on each week by project or day</li>
			<li><Link href="/projects">Projects</Link>: manage your projects</li>
          </ul>
				</Col>
				<Col
					xs="auto"
					//make the contents align to the bottom
					className="mt-5 md-mt-0"
				>
					<Image priority src={logoBlackSvg} alt="Moonstone" width={100} />
				</Col>
			</Row>

			<div className="footer-text">Chatoyant Solutions</div>
		</Container>
	);
}
