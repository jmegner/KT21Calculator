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
import { calcRemainingWounds } from 'src/CalcEngineFight';
import FightResultsDisplay from 'src/components/FightResultsDisplay';
import FightOptions from 'src/FightOptions';

const FightSection: React.FC = () => {
  const [fighterA, setFighterA] = React.useState(new Attacker());
  const [fighterB, setFighterB] = React.useState(new Attacker());
  const [fightOptions, setFightOptions] = React.useState(new FightOptions());
  const aFirst = fightOptions.firstFighter === 'A';
  const [fighter1WoundProbs, fighter2WoundProbs] = calcRemainingWounds(
    aFirst ? fighterA : fighterB,
    aFirst ? fighterB : fighterA,
    aFirst ? fightOptions.strategyFighterA : fightOptions.strategyFighterB,
    aFirst ? fightOptions.strategyFighterB : fightOptions.strategyFighterA,
    fightOptions.numRounds,
  );
  const fighterAWoundProbs = aFirst ? fighter1WoundProbs : fighter2WoundProbs;
  const fighterBWoundProbs = aFirst ? fighter2WoundProbs : fighter1WoundProbs;

  return (
    <Container style={{width: '800'}}>
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
            fightOptions={fightOptions}
            changeHandler={setFightOptions}
          />
        </Col>
      </Row>
      <Row className='border'>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <FightResultsDisplay
            fighterAWoundProbs={fighterAWoundProbs}
            fighterBWoundProbs={fighterBWoundProbs}
            fighterAWoundsOrig={fighterA.wounds}
            fighterBWoundsOrig={fighterB.wounds}
          />
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
              <li>
                All strategies will do certain no-downside actions, with the consequence that 
                "Strike" will still sometimes parry and "Parry" will still sometimes strike.
                <ul>
                  <li>If fighter can kill enemy in next strike, they will do so.</li>
                  <li>If fighter can parry enemy's last success and still kill enemy afterwards, they will do so.</li>
                </ul>
              </li>
              <li>
                Balanced will only reroll a fail even if would be wise to reroll a normal success.
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FightSection;