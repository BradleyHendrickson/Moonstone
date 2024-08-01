'use client'

import { useState} from 'react'
import "../globals.css";
//import { login, signup, signUpUser, signInUser } from './actions'
import { Container, Card, CardTitle, Row, Col, Button, Form, FormGroup, Label, Input, CardBody, Alert} from 'reactstrap';
import { createClient } from '@/utils/supabase/client'
import { Lora, Prompt, Inter } from 'next/font/google'

const prompt = Prompt({
  subsets: ['latin'],
  weight: ['400', '700'], // You can specify the weights you need
  display: 'swap',
});

export default function Login() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')


  async function signUpNewUser() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'https://moonstone-prod.vercel.app/',
      },
    })

    if (error) {
      setMessage(error.message)
    }
    else {
      setSuccessMessage('Check your email to confirm your account')
    }

  }
  
  async function signInWithEmail() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) {
      setMessage(error.message)
    }

    if (!error && data) {
      // redirect to /
      window.location.href = '/dashboard'
    }
  }
  
  const onDismiss = () => setMessage('')

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1a1f71, #9a3f1b)',
          minHeight: '100vh',
          overflow: 'hidden', // Prevents scrolling of the background gradient
          position: 'fixed', // Fixes the element so it doesn't scroll
          top: 0, left: 0, right: 0, bottom: 0, // Ensures the element covers the entire viewport
          zIndex: -1, // Places the background behind other content
          filter: 'grayscale(70%)' // Applies heavy greyscale
          //lighten the greyscaled background
        }}
      ></div>
      
    <Container className={prompt.className}>
      <script src="https://accounts.google.com/gsi/client" async></script>
    <Row>
      <Col style={{
          display: 'flex',
          justifyContent: 'center',
      }}>
        <Card className='mt-5' style={{width:"400px"}}>
        <CardTitle tag="h5" className="text-center mt-3"><strong>Login to Moonstone</strong></CardTitle>
            <CardBody>

              <Row>
                <Col>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Label for="password">Password</Label>
                    <Input type="password" name="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  {/* add an x button that clears the message */}
                  { message && <Alert className="p-2" color="danger">{message}</Alert> }
                  { successMessage && <Alert className="p-2" color="success">{successMessage}</Alert> }


                </Col>
              </Row>
              <Row>
                <Col>
                  <Button className='mt-3' style={{width:"100%"}} color="secondary" onClick={signUpNewUser}>Sign Up</Button>
                </Col>
                <Col>
                  <Button className='mt-3' style={{width:"100%", float:"right"}} color="primary" onClick={signInWithEmail}>Login</Button>
                </Col>
              </Row>
              
            </CardBody>
          </Card>
        </Col>
      </Row>
      <div className="footer-text" style={{color:"#909090"}}>Chatoyant Solutions</div>
    </Container>
    </>
  );
}
