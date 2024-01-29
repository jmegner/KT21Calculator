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

import * as Util from "src/Util";
import { calcDmgProbs } from 'src/Deadzone/CalcEngine';
import ModelControls from './ModelControls';
import ResultsDisplay from './ResultsDisplay';
import OptionControls from './OptionControls';
import { DeadzoneModel, DeadzoneOptions, } from "src/DiceSim/pkg/dice_sim";

export const Situation: FC = () => {
  const [attacker, setAttacker] = useState(new DeadzoneModel());
  const [defender, setDefender] = useState(new DeadzoneModel());
  const [options, setOptions] = useState(new DeadzoneOptions());

  const dmgToProb = useMemo(
    () => calcDmgProbs(attacker, defender, options),
    [attacker, defender, options]);

  return (
    <Container style={{width: '360px'}}>
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
    </Container>
  );
};
