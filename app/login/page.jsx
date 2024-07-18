import { login, signup } from './actions'
import { Container, Card, CardTitle, Row, Col, Button, Form, FormGroup, Label, Input, CardBody } from 'reactstrap';
export default function Login() {


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
              <form>
                  <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input className="form-control" id="email" name="email" type="email" required />
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="password">Password</label>
                    <input className="form-control" id="password" name="password" type="password" required />
                  </div>

                <Row className='mt-4'>
                  <Col>
                <button className="btn btn-secondary" formAction={signup} style={{width:"165px"}}>Sign up</button>
                </Col>
                <Col>
                <button className="btn btn-primary" formAction={login} style={{width:"165px"}}>Log in</button>
                </Col>
                </Row>
          </form>
          </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
