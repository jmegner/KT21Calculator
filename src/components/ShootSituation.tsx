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
    <Container>
      <Row>
        <Col className='border' md={6} sm={6}>
          <AttackerControls attacker={attacker} changeHandler={setAttacker} />
        </Col>
        <Col className='border' md={6} sm={6}>
          <DefenderControls defender={defender} changeHandler={setDefender} />
        </Col>
      </Row>
      <Row className='border justify-content-center'>
        <Col>
          <ShootOptionControls shootOptions={shootOptions} changeHandler={setShootOptions} />
        </Col>
      </Row>
      <Row className='border justify-content-center'>
        <ShootResultsDisplay saveToDmgToProb={saveToDmgToProb} defender={defender} />
      </Row>
    </Container>
  );
};
