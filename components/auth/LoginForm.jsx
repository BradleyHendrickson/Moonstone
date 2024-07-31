'use client'
import React from 'react';

import {Container, Card, CardBody, CardTitle, CardText, CardSubtitle, Button, Row, Col, FormGroup, Label, Input} from 'reactstrap';

import { createClient } from '@/utils/supabase/client'; 

export async function login(credentials) {
  const supabase = createClient();

  const { email, password } = credentials;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message); // Handle error appropriately in client-side context
    }

    // Handle successful login (e.g., redirect, state update)
  } catch (error) {
    console.error('Login error:', error);
    // Handle error (e.g., show error message to user)
  }
}

export async function signup(credentials) {
  const supabase = createClient();

  const { email, password } = credentials;

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message); // Handle error appropriately in client-side context
    }

    // Handle successful signup (e.g., redirect, state update)
  } catch (error) {
    console.error('Signup error:', error);
    // Handle error (e.g., show error message to user)
  }
}


export default function LoginForm() {
    return (
        <Container>
        <Row>
          <Col style={{
              display: 'flex',
              justifyContent: 'center',
          }}>
            <Card className='mt-5' style={{width:"400px"}}>
            <CardTitle tag="h5" className="text-center mt-3">Login to Moonstone</CardTitle>
              <CardBody>
                <FormGroup>
                  <Label for="email">Email:</Label>
                  <Input id="email" name="email" type="email" required />
  
                </FormGroup>
                <FormGroup>
                  <Label for="password">Password:</Label>
                  <Input id="password" name="password" type="password" required />
                </FormGroup>


                <Row style={{float:"right"}} className='mt-3'>
                    <Col xs="auto">
                        <Button color="secondary" onClick={() => {
                            signup({email: document.getElementById('email').value, password: document.getElementById('password').value})
                        }} style={{width:"170px"}}>Sign Up</Button>
                    </Col>
                    <Col xs="auto">
                        
                        <Button color="primary"  onClick={() => {
                            login({email: document.getElementById('email').value, password: document.getElementById('password').value})
                        }} style={{width:"170px"}}>Login</Button>
                    </Col>
                </Row>
  
              </CardBody>
            </Card>
          </Col>
        </Row>
  
      </Container>
    )
}