import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import * as N from 'src/Notes';
import { ShootSituation } from './ShootSituation';
import Model from 'src/Model';
import ShootOptions from 'src/ShootOptions';
import { calcDmgProbs } from 'src/CalcEngineShoot';
import { SaveRange } from 'src/KtMisc';
import ShootResultsDisplay from './ShootResultsDisplay';
import { combineDmgProbs } from 'src/CalcEngineCommon';

const ShootSection: React.FC = () => {
  const [attacker1, setAttacker1] = React.useState(new Model());
  const [defender1, setDefender1] = React.useState(Model.basicDefender());
  const [shootOptions1, setShootOptions1] = React.useState(new ShootOptions());

  const saveToDmgToProb1 = React.useMemo(
    () => new Map<number,Map<number,number>>(SaveRange.map(save =>
      [save, calcDmgProbs(attacker1, defender1.withProp('diceStat', save), shootOptions1)])),
    [attacker1, defender1, shootOptions1]);

  const [attacker2, setAttacker2] = React.useState(new Model());
  const [defender2, setDefender2] = React.useState(Model.basicDefender());
  const [shootOptions2, setShootOptions2] = React.useState(new ShootOptions());

  const saveToDmgToProb2 = React.useMemo(
    () => new Map<number,Map<number,number>>(SaveRange.map(save =>
      [save, calcDmgProbs(attacker2, defender2.withProp('diceStat', save), shootOptions2)])),
    [attacker2, defender2, shootOptions2]);

  const saveToDmgToProbCombined = new Map<number,Map<number,number>>(SaveRange.map(save =>
    [save, combineDmgProbs(saveToDmgToProb1.get(save)!, saveToDmgToProb2.get(save)!)]));

  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
    N.Reroll,
    N.Rending,
    N.Severe,
    N.ObscuredTarget,
    N.AutoNorms,
    N.AutoCrits,
    N.CoverNormSaves,
    N.CoverCritSaves,
    N.NormsToCrits,
    N.FailToNormIfCrit,
    N.PuritySeal,
    N.CloseAssault2021,
    N.InvulnSave,
    N.Durable2021,
    N.HardyX,
    N.FeelNoPain,
    N.EliteModerate2021,
    N.EliteExtreme2021,
    N.JustAScratch2021,
    N.FireTeamRules,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: 'fit-content'}}>
      <Row>
        Kill Team 2024 Edition, Shooting&nbsp;
        <a href='https://assets.warhammer-community.com/killteam_keydownloads_literules_eng-jfhe9v0j7c-n0x6ozmgo9.pdf'>[Lite Rules]</a>
      </Row>
      <Row>
        <Col className='border p-0'>
          Situation1
          <ShootSituation
            attacker={attacker1}
            setAttacker={setAttacker1}
            defender={defender1}
            setDefender={setDefender1}
            shootOptions={shootOptions1}
            setShootOptions={setShootOptions1}
            saveToDmgToProb={saveToDmgToProb1}
            />
        </Col>
        <Col className='border p-0'>
          Situation2
          <ShootSituation
            attacker={attacker2}
            setAttacker={setAttacker2}
            defender={defender2}
            setDefender={setDefender2}
            shootOptions={shootOptions2}
            setShootOptions={setShootOptions2}
            saveToDmgToProb={saveToDmgToProb2}
            />
        </Col>
      </Row>
      <div className='border p-0'>
        <Row className={Util.centerHoriz}>
          Situation 1&2 Combo using W={defender1.wounds} from Situation1
        </Row>
        <Row>
          <ShootResultsDisplay saveToDmgToProb={saveToDmgToProbCombined} defender={defender1} />
        </Row>
      </div>
      <Row>
        <Col className={Util.centerHoriz + ' border'} style={{fontSize: '11px'}}>
          <Credits/>
        </Col>
      </Row>
      <Row style={{width: '800px'}}>
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