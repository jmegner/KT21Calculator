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

  const damageToProb = calcDamageProbabilities(attacker, defender, rounds);

  return (
    <Container style={{width: '800px'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'}>
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
        <ResultsDisplay damageToProb={damageToProb} defender={defender} />
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' border'} style={{fontSize: '11px'}}>
          <p>
            <a href="https://github.com/jmegner/KT21Calculator">GitHub source code repository</a> <br />
            Authored by <a href="https://github.com/jmegner">Jacob Egner</a>.<br />
            Inspired by <a href="https://github.com/ramainen">Damir Fakhrutdinov</a>'s Monte-Carlo-based <a href="http://kt2.doit-cms.ru/">Kill Team Simulator 2</a>.<br />
          </p>
        </Col>
      </Row>
      <Row>
        <Col className='border' style={{fontSize: '11px'}}>
          <p>
            Notes:
            <ul>
              <li>AvgDamageBounded is the average of damage bounded by the number of the defender's wounds.</li>
              <li>AvgDamageUnbounded is the average of damage without regard to defender's wounds.</li>
              <li>Use MWx for Splash X</li>
              <li>
                Feel No Pain (FNP) refers to the category of abilities where just before damage is actually resolved,
                you roll a die for each potential wound, and each rolled success prevents a wound from being lost.
                Even MWx damage can be prevented via FNP.
              </li>
              <li>
                "Starfire" refers to Necron's
                &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/tomb-world/#Equipment">Starfire Core</a>&#x202F;
                equipment, which allows you to transform a failed hit into a normal hit if you had at least one
                critical hit.
              </li>
              <li>
                Balanced and Chitin (Hive Fleet's
                &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/hive-fleet/#Equipment">Extended Chitin</a>&#x202F;
                equipment) will only reroll a fail, never a normal success, even if it would be wise to do so.
              </li>
            </ul>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default App;