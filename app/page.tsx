'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { Container, Row, Col, Card, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import logoBlackSvg from '/public/logo_black.svg';


export default function Index() {

  return (
  <Container>
    <Row
      //center the contents
      className="justify-content-center"
    >

    <Col xs="auto">
    <h2 className="mt-5">Welcome to Moonstone</h2>
    <h5>Create an account to begin tracking your project time</h5>
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
