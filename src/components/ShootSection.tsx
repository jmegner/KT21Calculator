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
import Credits from 'src/components/Credits';

import Attacker from 'src/Attacker';
import Defender from 'src/Defender';
import * as Util from "src/Util";
import { calcDmgProbs } from 'src/CalcEngineShoot';
import * as N from 'src/Notes';
import { SaveRange } from 'src/KtMisc';

const ShootSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [shootOptions, setShootOptions] = React.useState(new ShootOptions());

  //const damageToProb = calcDmgProbs(attacker, defender, shootOptions);

  const saveToDmgToProb = new Map<number,Map<number,number>>(SaveRange.map(save =>
    [save, calcDmgProbs(attacker, defender.withProp('save', save), shootOptions)]));
  
  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
    N.Reroll,
    N.Rending,
    N.Starfire,
    N.AutoNorms,
    N.AutoCrits,
    N.CoverNormSaves,
    N.CoverCritSaves,
    N.NormsToCrits,
    N.InvulnSave,
    //N.Durable,
    N.HardyX,
    N.FeelNoPain,
    N.EliteModerate,
    N.EliteExtreme,
    N.FireTeamRules,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '510px'}}>
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

export default ShootSection;