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
import {Situation} from './Situation';
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
    <Container style={{width: '750px'}}>
      <Row>
        Deadzone, Third Edition&nbsp;
        <a href='https://companion.manticgames.com/deadzone-rules/'>[Rules]</a>&nbsp;
        <a href='https://www.orderofgamers.com/downloads/DeadzoneThirdEdition_v1.4.pdf'>[Reference]</a>
      </Row>
      <Row >
        <Col className='border p-0'>
          Situation1
          <Situation/>
        </Col>
        <Col className='border p-0'>
          Situation2
          <Situation/>
        </Col>
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
