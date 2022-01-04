import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Attacker from '../Attacker';
import Defender from '../Defender';
import Credits from './Credits';
import * as Util from "../Util";
import { calcDamageProbabilities } from '../KT21CalcEngine';

const MeleeSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [rounds, setRounds] = React.useState(1);

  const damageToProb = calcDamageProbabilities(attacker, defender, rounds);

  return (
    <Container style={{width: '800px'}}>
      <Row><Col>WORK IN PROGRESS</Col></Row>
      <Row>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          Operative1 Goes Here
        </Col>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          Operative2 Goes Here
        </Col>
      </Row>
      <Row className='border'>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          General Options Goes Here
        </Col>
      </Row>
      <Row className='border'>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          Results Goes Here
        </Col>
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
              <li>AvgDamageBounded is the average of damage bounded by the number of the other operative's wounds.</li>
              <li>
                Feel No Pain (FNP) refers to the category of abilities where just before damage is actually resolved,
                you roll a die for each potential wound, and each rolled success prevents a wound from being lost.
                Even MWx damage can be prevented via FNP.
              </li>
              <li>
                Balanced will only reroll a fail even if would be wise to reroll a normal success.
              </li>
            </ul>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default MeleeSection;