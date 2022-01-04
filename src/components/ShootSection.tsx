import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Attacker from '../Attacker';
import Defender from '../Defender';
import AttackerControls from "./AttackerControls";
import DefenderControls from "./DefenderControls";
import CalcControls from './CalcControls';
import ResultsDisplay from './ResultsDisplay';
import Credits from './Credits';
import * as Util from "../Util";
import { calcDamageProbabilities } from '../KT21CalcEngine';

const ShootSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [rounds, setRounds] = React.useState(1);

  const damageToProb = calcDamageProbabilities(attacker, defender, rounds);

  return (
    <Container style={{width: '520px'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'} xs='8'>
          <Container>
            <Row className='border'>
              <AttackerControls attacker={attacker} changeHandler={setAttacker} />
            </Row>
            <Row className='border'>
              <CalcControls rounds={rounds} roundsChangeHandler={setRounds} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border' } xs='4'>
          <DefenderControls defender={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='border'>
        <ResultsDisplay damageToProb={damageToProb} defender={defender} />
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' border'} style={{fontSize: '11px'}}>
          <Credits/>
        </Col>
      </Row>
      <Row>
        <Col className='border' style={{fontSize: '11px'}}>
          <p>
            Notes:
            <ul>
              <li>AvgDamageBounded is the average of damage bounded by the number of the defender's wounds.</li>
              <li>AvgDamageUnbounded is the average of damage without regard to defender's wounds.</li>
              <li>InvulnSave is always used if valid.</li>
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
                equipment) will only reroll a fail even if would be wise to reroll a normal success.
              </li>
            </ul>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default ShootSection;