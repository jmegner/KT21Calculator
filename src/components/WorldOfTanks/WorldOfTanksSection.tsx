import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';
import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';

import * as Util from "src/Util";
import Tank from 'src/WorldOfTanks/Tank';
import { calcDmgAndCritProbs } from 'src/WorldOfTanks/CalcEngineWorldOfTanks';
import TankControls from 'src/components/WorldOfTanks/TankControls';
import ResultsDisplay from 'src/components/WorldOfTanks/ResultsDisplay';

const WorldOfTanksSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Tank());
  const [defender, setDefender] = React.useState(new Tank());
  const [numRounds, setNumRounds] = React.useState(1);

  const [dmgToProb, critsToProb] = calcDmgAndCritProbs(attacker, defender, numRounds);

  const numRoundsParam = new IncProps('NumRounds', numRounds, Util.span(1, 10), Util.acceptNumToAcceptString(setNumRounds));

  return (
    <Container style={{width: '400px'}}>
      <Row>
        <a href='https://www.gf9games.com/worldoftanks/'>World Of Tanks</a>
        &#x202F;(<a href='https://www.gf9games.com/worldoftanks/wp-content/uploads/2020/06/WOT-Rulebook-FINAL-Small.pdf'>Rules PDF</a>)
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'} xs='auto'>
          <Container>
            <Row className='border'>
              <TankControls tank={attacker} isAttacker={true} changeHandler={setAttacker} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border' } xs='auto'>
          <Container>
            <Row className='border'>
              <TankControls tank={defender} isAttacker={false} changeHandler={setDefender} />
            </Row>
            <Row className='border'>
              <Container>
                <Row>
                  General Options
                </Row>
                <Row>
                  <IncDecSelect {...numRoundsParam} />
                </Row>
              </Container>
            </Row>
          </Container>
        </Col>
      </Row>
      <Row className='border'>
        <ResultsDisplay dmgToProb={dmgToProb} critsToProb={critsToProb} defender={defender} />
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
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default WorldOfTanksSection;