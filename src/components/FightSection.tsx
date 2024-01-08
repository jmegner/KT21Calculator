import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';
import * as Util from "src/Util";
import FighterControls from 'src/components/FighterControls';
import Model from 'src/Model';
import FightOptionControls from 'src/components/FightOptionControls';
import { calcRemainingWounds } from 'src/CalcEngineFight';
import FightResultsDisplay from 'src/components/FightResultsDisplay';
import FightOptions from 'src/FightOptions';
import * as N from 'src/Notes';

const FightSection: React.FC = () => {
  const [fighterA, setFighterA] = React.useState(new Model());
  const [fighterB, setFighterB] = React.useState(new Model());
  const [fightOptions, setFightOptions] = React.useState(new FightOptions());
  const aFirst = fightOptions.firstFighter === 'A';
  const [fighter1WoundProbs, fighter2WoundProbs] = React.useMemo(
    () => calcRemainingWounds(
      aFirst ? fighterA : fighterB,
      aFirst ? fighterB : fighterA,
      aFirst ? fightOptions.strategyFighterA : fightOptions.strategyFighterB,
      aFirst ? fightOptions.strategyFighterB : fightOptions.strategyFighterA,
      fightOptions.numRounds,
    ),
    [fighterA, fighterB, fightOptions, aFirst]);
  const fighterAWoundProbs = aFirst ? fighter1WoundProbs : fighter2WoundProbs;
  const fighterBWoundProbs = aFirst ? fighter2WoundProbs : fighter1WoundProbs;

  const noteListItems: JSX.Element[] = [
    N.Reroll,
    N.Rending,
    N.Brutal,
    N.StunMelee,
    N.NicheAbility,
    N.AutoNorms,
    N.AutoCrits,
    N.CloseAssault,
    N.Waaagh,
    N.EliteModerate,
    N.EliteExtreme,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '400'}}>
      <Row>
        Kill Team 2021 Edition, Fighting
        <a href='https://www.warhammer-community.com/wp-content/uploads/2022/08/ekD0GG2pTHlYba0G.pdf'>[Lite Rules]</a>
      </Row>
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
                Balanced and Relentless will not reroll a normal success even if it would be wise to do so.
              </li>
              {noteListItems}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FightSection;