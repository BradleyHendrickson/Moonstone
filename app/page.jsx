'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import logoBlackSvg from '/public/logo_black.svg';
import { createClient } from '@/utils/supabase/client';
import  Link  from  'next/link';
export default function Index() {

  const [user, setUser] = useState(null)

    const supabase = createClient()
    useEffect(() => {
      getUser()
  }, []);

  async function getUser() {
    try {
      const {data: {user}} = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.log(error)
    }
  }

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
      className="d-flex align-items-end"
    >
      <Image
      priority
      src={logoBlackSvg}
      alt="Moonstone"
        width={100}
    />
      </Col>
    </Row>
    
  </Container>
  )

}
