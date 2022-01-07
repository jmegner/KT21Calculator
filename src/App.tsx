import React from 'react';
import {
  Button,
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import ShootSection from 'src/components/ShootSection';
import FightSection from 'src/components/FightSection';
import * as Util from "src/Util";

const App: React.FC = () => {
  const [isShootVisible, setIsShootVisible] = React.useState(true);
  const currMode = () => isShootVisible ? 'Shoot' : 'Fight';
  const otherMode = () => !isShootVisible ? 'Shoot' : 'Fight';

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
          <span style={{display: isShootVisible ? 'initial' : 'none'}}>
            <ShootSection/>
          </span>
          <span style={{display: isShootVisible ? 'none' : 'initial'}}>
            <FightSection />
          </span>
        </Col>
      </Row>
    </Container>
  );
};

export default App;