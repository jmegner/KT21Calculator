import React from 'react';
import ShootSection from './components/ShootSection';
import MeleeSection from './components/MeleeSection';
import {
  Button,
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import * as Util from "./Util";

const App: React.FC = () => {
  const [isShootVisible, setIsShootVisible] = React.useState(true);
  const currMode = () => isShootVisible ? 'Shoot' : 'Melee';
  const otherMode = () => !isShootVisible ? 'Shoot' : 'Melee';

  return (
    <Container className="m-0 p-0">
      <Row className='mb-1'>
        <Col className={Util.centerHorizVert}>
          {currMode()}
          &nbsp; &nbsp;
          <Button onClick={() => setIsShootVisible(!isShootVisible)}>Switch to {otherMode()}</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {isShootVisible ? <ShootSection/> : <MeleeSection/>}
        </Col>
      </Row>
    </Container>
  );
};

export default App;