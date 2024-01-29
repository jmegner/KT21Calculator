import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import ShootOptions from 'src/ShootOptions';
import AttackerControls from "src/components/AttackerControls";
import DefenderControls from "src/components/DefenderControls";
import ShootOptionControls from 'src/components/ShootOptionControls';
import ShootResultsDisplay from 'src/components/ShootResultsDisplay';

import Model from 'src/Model';
import * as Util from "src/Util";
import { calcDmgProbs } from 'src/CalcEngineShoot';
import { SaveRange } from 'src/KtMisc';

export const ShootSituation: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Model());
  const [defender, setDefender] = React.useState(Model.basicDefender());
  const [shootOptions, setShootOptions] = React.useState(new ShootOptions());

  const saveToDmgToProb = React.useMemo(
    () => new Map<number,Map<number,number>>(SaveRange.map(save =>
      [save, calcDmgProbs(attacker, defender.withProp('diceStat', save), shootOptions)])),
    [attacker, defender, shootOptions]);

  return (
    <Container style={{width: '550px'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'} xs='auto'>
          <Container>
            <Row className='border'>
              <AttackerControls attacker={attacker} changeHandler={setAttacker} />
            </Row>
            <Row className='border'>
              <ShootOptionControls shootOptions={shootOptions} changeHandler={setShootOptions} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border' } xs='auto'>
          <DefenderControls defender={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='border'>
        <ShootResultsDisplay saveToDmgToProb={saveToDmgToProb} defender={defender} />
      </Row>
    </Container>
  );
};
