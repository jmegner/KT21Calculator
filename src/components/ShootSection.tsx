import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Attacker from 'src/Attacker';
import Defender from 'src/Defender';
import AttackerControls from "src/components/AttackerControls";
import DefenderControls from "src/components/DefenderControls";
import CalcControls from 'src/components/CalcControls';
import ShootResultsDisplay from 'src/components/ShootResultsDisplay';
import Credits from 'src/components/Credits';
import * as Util from "src/Util";
import { calcDmgProbs } from 'src/CalcEngineShoot';

const ShootSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [rounds, setRounds] = React.useState(1);

  const damageToProb = calcDmgProbs(attacker, defender, rounds);

  return (
    <Container style={{width: '510px'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'} xs='auto'>
          <Container>
            <Row className='border'>
              <AttackerControls attacker={attacker} changeHandler={setAttacker} />
            </Row>
            <Row className='border'>
              <CalcControls rounds={rounds} roundsChangeHandler={setRounds} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border' } xs='auto'>
          <DefenderControls defender={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='border'>
        <ShootResultsDisplay damageToProb={damageToProb} defender={defender} />
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' border'} style={{fontSize: '11px'}}>
          <Credits/>
        </Col>
      </Row>
      <Row>
        <Col className='border' style={{fontSize: '11px'}}>
          Notes:
          <ul>
            <li>AvgDamageBounded is the average of damage bounded by the number of the defender's wounds.</li>
            <li>AvgDamageUnbounded is the average of damage without regard to defender's wounds.</li>
            <li>InvulnSave is always used if valid.</li>
            <li>
              Feel No Pain (FNP) refers to the category of abilities where just before damage is actually resolved,
              you roll a die for each potential wound, and each rolled success prevents a wound from being lost.
              Even MWx damage can be prevented via FNP. The
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/death-guard#Plague-Marine-Warrior-">Plague Marine (Warrior)</a>&#x202F;
              ability Disgustingly Resilient is a FNP=5+ ability.
            </li>
            <li>
              "Starfire" refers to
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/tomb-world/#Equipment">Necron Equipment</a>&#x202F;
              Starfire Core, which allows you to transform a failed hit into a normal hit if you had at least one
              critical hit.
            </li>
            <li>
              Balanced and Chitin
              (<a href="https://wahapedia.ru/kill-team2/kill-teams/hive-fleet/#Equipment">Hive Fleet equipment</a> Extended Chitin)
              will only reroll a fail even if would be wise to reroll a normal success.
            </li>
            <li>
              Cover saves can go up to 2 via the
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/hive-fleet#Strategic-Ploys">Hive Fleet strategic ploy</a>&#x202F;
              Lurk and the
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/brood-coven#Strategic-Ploys">Brood Coven strategic ploy</a>&#x202F;
              Lurk In The Shadows. Lurk In The Shadows also allows a defender's 1 cover save to count as a critical save, but that is not implemented.
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default ShootSection;