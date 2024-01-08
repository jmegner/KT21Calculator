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

import Model from 'src/Model';
import * as Util from "src/Util";
import { calcDmgProbs } from 'src/CalcEngineShoot';
import * as N from 'src/Notes';
import { SaveRange } from 'src/KtMisc';

const ShootSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Model());
  const [defender, setDefender] = React.useState(Model.basicDefender());
  const [shootOptions, setShootOptions] = React.useState(new ShootOptions());

  const saveToDmgToProb = React.useMemo(
    () => new Map<number,Map<number,number>>(SaveRange.map(save =>
      [save, calcDmgProbs(attacker, defender.withProp('diceStat', save), shootOptions)])),
    [attacker, defender, shootOptions]);

  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
    N.Reroll,
    N.Rending,
    N.FailToNormIfCrit,
    N.CloseAssault,
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
    N.JustAScratch,
    N.FireTeamRules,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '600px'}}>
      <Row>
        Kill Team 2021 Edition, Shooting
        <a href='https://www.warhammer-community.com/wp-content/uploads/2022/08/ekD0GG2pTHlYba0G.pdf'>[Lite Rules]</a>
      </Row>
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