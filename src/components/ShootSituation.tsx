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
import { Accepter } from 'src/Util';

export interface Props {
  attacker: Model;
  setAttacker: Accepter<Model>;
  defender: Model;
  setDefender: Accepter<Model>;
  shootOptions: ShootOptions;
  setShootOptions: Accepter<ShootOptions>;
  saveToDmgToProb: Map<number,Map<number,number>>;
}

export const ShootSituation: React.FC<Props> = (props: Props) => {
  return (
    <Container style={{width: 'fit-content'}}>
      <Row>
        <Col className={Util.centerHoriz + ' p-0'} xs='auto'>
          <Container>
            <Row className='border'>
              <AttackerControls attacker={props.attacker} changeHandler={props.setAttacker} />
            </Row>
            <Row className='border'>
              <ShootOptionControls shootOptions={props.shootOptions} changeHandler={props.setShootOptions} />
            </Row>
          </Container>
        </Col>
        <Col className={Util.centerHoriz + ' border' } xs='auto'>
          <DefenderControls defender={props.defender} changeHandler={props.setDefender} />
        </Col>
      </Row>
      <Row className='border'>
        <ShootResultsDisplay saveToDmgToProb={props.saveToDmgToProb} defender={props.defender} />
      </Row>
    </Container>
  );
};
