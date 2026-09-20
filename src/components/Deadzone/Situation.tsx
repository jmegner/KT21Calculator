import {
  FC,
  useMemo,
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
import { Accepter } from 'src/Util';

export function newDeadzoneSituation(isHaloFlashpoint: boolean) {
  const options = new DeadzoneOptions();
  options.isHaloFlashpoint = isHaloFlashpoint;
  return {attacker: new DeadzoneModel(), defender: new DeadzoneModel(), options};
}

export type DeadzoneSituationState = ReturnType<typeof newDeadzoneSituation>;

export const Situation: FC<{state: DeadzoneSituationState; onChange: Accepter<DeadzoneSituationState>}> = ({state, onChange}) => {
  const {attacker, defender, options} = state;
  const isHaloFlashpoint = options.isHaloFlashpoint;
  const setAttacker = (value: DeadzoneModel) => onChange({...state, attacker: value});
  const setDefender = (value: DeadzoneModel) => onChange({...state, defender: value});
  const setOptions = (value: DeadzoneOptions) => onChange({...state, options: value});

  const dmgToProb = useMemo(
    () => calcDmgProbs(attacker, defender, options),
    [attacker, defender, options]);

  return (
    <Container style={{width: isHaloFlashpoint ? '320px' : '360px'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <ModelControls isHaloFlashpoint={isHaloFlashpoint} isAttacker={true} model={attacker} changeHandler={setAttacker} />
        </Col>
        <Col className={Util.centerHoriz + ' p-0 border'}>
          <ModelControls isHaloFlashpoint={isHaloFlashpoint} isAttacker={false} model={defender} changeHandler={setDefender} />
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
