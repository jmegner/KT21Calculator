import {
  FC,
  useMemo,
  useState,
} from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import { calcDmgProbs } from 'src/Deadzone/CalcEngine';
import * as N from 'src/Notes';
import ModelControls from './ModelControls';
import ResultsDisplay from './ResultsDisplay';
import OptionControls from './OptionControls';
import { DeadzoneModel, DeadzoneOptions, } from "src/DiceSim/pkg/dice_sim";

export const DeadzoneSection: FC = () => {
  const [attacker, setAttacker] = useState(new DeadzoneModel());
  const [defender, setDefender] = useState(new DeadzoneModel());
  const [options, setOptions] = useState(new DeadzoneOptions());

  const dmgToProb = useMemo(
    () => calcDmgProbs(attacker, defender, options),
    [attacker, defender, options]);

  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '360px'}}>
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
        <OptionControls options={options} changeHandler={setOptions} />
      </Row>
      <Row className='border'>
        <ResultsDisplay dmgToProb={dmgToProb} attackerHp={attacker.hp} defenderHp={defender.hp} attackerCanBeDamaged={options.attackerCanBeDamaged} />
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
