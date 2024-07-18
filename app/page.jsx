'use server'
import Image from "next/image";
import "./globals.css";
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import logoBlackSvg from '/public/logo_black.svg';
import { createClient } from '@/utils/supabase/server';
import  Link  from  'next/link';
export default async function Index() {
  const supabase = createClient();

  const {data: {user}} = await supabase.auth.getUser()

  return (
  <Container>
    <Row
      //center the contents
      className="justify-content-center"
    >
    <Col xs="auto">
    <h2 className="mt-5">Welcome to Moonstone.</h2>
    { user ? (<h5>Check out the <Link href='/dashboard'>Dashboard</Link> to start tracking!</h5>) : (<h5>Create an account to begin tracking your project time</h5>)}
    </Col>
    <Col xs="auto" 
      //make the contents align to the bottom
      className="d-flex align-items-end mt-5 md-mt-0"
    >
      <Image
      priority
      src={logoBlackSvg}
      alt="Moonstone"
        width={100}
    />
      </Col>
    </Row>
    <div className="footer-text">Chatoyant Solutions</div>
  </Container>
  )

}
