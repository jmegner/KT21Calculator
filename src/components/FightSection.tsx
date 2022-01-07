import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';
import * as Util from "src/Util";
import FighterControls from 'src/components/FighterControls';
import Attacker from 'src/Attacker';
import FightOptionControls from 'src/components/FightOptionControls';
import FightStrategy from 'src/FightStrategy';

const FightSection: React.FC = () => {
  const [fighterA, setFighterA] = React.useState(new Attacker());
  const [fighterB, setFighterB] = React.useState(new Attacker());
  const [strategyFighterA, setStrategyFighterA] = React.useState(FightStrategy.MaxDmgToEnemy);
  const [strategyFighterB, setStrategyFighterB] = React.useState(FightStrategy.MaxDmgToEnemy);
  const [firstFighter, setFirstFighter] = React.useState('A');

  return (
    <Container style={{width: '800'}}>
      <h1>WORK IN PROGRESS, DOES NOT WORK, DO NOT USE</h1>
      <Row>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <FighterControls title="Fighter A" attacker={fighterA} changeHandler={setFighterA} />
        </Col>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <FighterControls title="Fighter B" attacker={fighterB} changeHandler={setFighterB} />
        </Col>
      </Row>
      <Row className='border'>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <FightOptionControls
            strategyFighterA={strategyFighterA}
            strategyFighterB={strategyFighterB}
            firstFighter={firstFighter}
            strategyFighterAChangeHandler={setStrategyFighterA}
            strategyFighterBChangeHandler={setStrategyFighterB}
            firstFighterChangeHandler={setFirstFighter}
          />
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
        <Col className={Util.centerHoriz + ' border'}>
          <div>
            Notes:
            <ul>
              <li>AvgDamageBounded is the average of damage bounded by the number of the other operative's wounds.</li>
              <li>defendother opative
                Feel No Pain (FNP) refers to the category of abilities where just before damage is actually resolved,
                you roll a die for each potential wound, and each rolled success prevents a wound from being lost.
                Even MWx damage can be prevented via FNP.
              </li>
              <li>
                Balanced will only reroll a fail even if would be wise to reroll a normal success.
              </li>do so.it , never a normal sucreroll a normal success.
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FightSection;