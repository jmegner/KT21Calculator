import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import { calcDmgProbs } from 'src/Deadzone/CalcEngine';
import * as N from 'src/Notes';
import Model from 'src/Deadzone/Model';
import { CombatOptions } from 'src/Deadzone/CombatOptions';
import ModelControls from './ModelControls';
import ResultsDisplay from './ResultsDisplay';
import CombatOptionControls from './CombatOptionControls';

export const DeadzoneSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Model());
  const [defender, setDefender] = React.useState(new Model());
  const [combatOptions, setCombatOptions] = React.useState(new CombatOptions());

  const dmgToProb = React.useMemo(
    () => calcDmgProbs(attacker, defender, combatOptions),
    [attacker, defender, combatOptions]);

  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '510px'}}>
      <Row>
        Deadzone, Third Edition
        <a href='https://companion.manticgames.com/deadzone-rules/'>[Rules]</a>
        <a href='https://boardgamegeek.com/filepage/239614/esoteric-order-gamers-deadzone-3rd-edition-rules-r'>[Reference]</a>
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <ModelControls isAttacker={true} model={attacker} changeHandler={setAttacker} />
        </Col>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <ModelControls isAttacker={false} model={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='p-0 border'>
        <CombatOptionControls combatOptions={combatOptions} changeHandler={setCombatOptions} />
      </Row>
      <Row className='border'>
        <ResultsDisplay dmgToProb={dmgToProb} attackerHp={attacker.hp} defenderHp={defender.hp} attackerCanBeDamaged={combatOptions.attackerCanBeDamaged} />
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
            {noteListItems}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};