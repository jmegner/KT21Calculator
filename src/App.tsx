import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Attacker from './Attacker';
import AttackerControls from "./components/AttackerControls";
import DefenderControls from "./components/DefenderControls";
import CalcControls from './components/CalcControls';
import * as Util from "./Util";

const App: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [rounds, setRounds] = React.useState(1);

  return (
    <Container style={{width: '800px'}}>
      <Row>
        <Col className={Util.centerHoriz}>
          <Container>
            <Row className='border'>
              <AttackerControls attacker={attacker} changeHandler={setAttacker} />
            </Row>
            <Row className='border'>
              <CalcControls rounds={rounds} roundsChangeHandler={setRounds} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border'}>
          <DefenderControls />
        </Col>
      </Row>
      <Row className='border'>
        Results (TODO)
      </Row>
    </Container>
  );
};

export default App;