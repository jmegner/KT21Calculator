import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from "src/Util";
import Tank from 'src/WorldOfTanks/Tank';
import { calcDmgAndCritProbs } from 'src/WorldOfTanks/CalcEngineWorldOfTanks';
import TankControls from 'src/components/WorldOfTanks/TankControls';
import ResultsDisplay from 'src/components/WorldOfTanks/ResultsDisplay';

export const newTankSituation = () => ({attacker: new Tank(), defender: new Tank(), numRounds: 1});
export type TankSituationState = ReturnType<typeof newTankSituation>;

const Situation: React.FC<{state: TankSituationState; onChange: Util.Accepter<TankSituationState>}> = ({state, onChange}) => {
  const {attacker, defender, numRounds} = state;
  const setAttacker = (value: Tank) => onChange({...state, attacker: value});
  const setDefender = (value: Tank) => onChange({...state, defender: value});
  const setNumRounds = (value: number) => onChange({...state, numRounds: value});

  const [dmgToProb, critsToProb] = React.useMemo(
    () => calcDmgAndCritProbs(attacker, defender, numRounds),
    [attacker, defender, numRounds]);

  const numRoundsParam = new IncProps('NumRounds', numRounds, Util.span(1, 10), Util.acceptNumToAcceptString(setNumRounds));

  return (
    <Container style={{width:'fit-content'}}>
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
    </Container>
  );
};

export default Situation;
