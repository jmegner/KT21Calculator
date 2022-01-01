import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Attacker from './Attacker';
import Defender from './Defender';
import AttackerControls from "./components/AttackerControls";
import DefenderControls from "./components/DefenderControls";
import CalcControls from './components/CalcControls';
import ResultsDisplay from './components/ResultsDisplay';
import * as Util from "./Util";
import { calcDamageProbabilities } from './KT21CalcEngine';

const App: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [rounds, setRounds] = React.useState(1);

  const damageToProb = calcDamageProbabilities(attacker, defender);

  let avgDamageUnbounded = 0;
  let avgDamageBounded = 0;
  damageToProb.forEach((prob, damage) => {
     avgDamageUnbounded += damage * prob;
     avgDamageBounded += Math.min(damage, defender.wounds) * prob;
  });

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
          <DefenderControls defender={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='border'>
        <ResultsDisplay avgDamage={avgDamageBounded} avgDamageUnbounded={avgDamageUnbounded} killChance={7.89} />
      </Row>
    </Container>
  );
};

export default App;