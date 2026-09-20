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
import { fieldSetter, useStoredState } from 'src/hooks/useStoredState';
import { copyChoices } from 'src/ChoiceStorage';
import { SituationActions } from './SectionActions';

const newShootSituation = () => ({
  attacker: new Model(), defender: Model.basicDefender(), options: new ShootOptions(),
  attackerAdvanced: false, defenderAdvanced: false,
});

const ShootSection: React.FC = () => {
  const [situation1, setSituation1] = useStoredState('shoot.s1', newShootSituation);
  const {attacker: attacker1, defender: defender1, options: shootOptions1} = situation1;
  const change1 = fieldSetter(setSituation1);

  const saveToDmgToProb1 = React.useMemo(
    () => new Map<number,Map<number,number>>(SaveRange.map(save =>
      [save, calcDmgProbs(attacker1, defender1.withProp('diceStat', save), shootOptions1)])),
    [attacker1, defender1, shootOptions1]);

  const [situation2, setSituation2] = useStoredState('shoot.s2', newShootSituation);
  const {attacker: attacker2, defender: defender2, options: shootOptions2} = situation2;
  const change2 = fieldSetter(setSituation2);

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
        Check out KTCalculator+ (
        <a href='https://play.google.com/store/apps/details?id=com.sunnyckh.ktcalculator'>Android</a>,{' '}
        <a href='https://apps.apple.com/us/app/ktcalculator/id6802795546'>iOS</a>) or
        &nbsp;<a href='https://ktcalc.com'>ktcalc.com</a>&nbsp; for a more up-to-date fork of this calculator.
      </Row>
      <Row>
        Kill Team 2024 Edition, Shooting&nbsp;
        <a href='https://assets.warhammer-community.com/killteam_keydownloads_literules_eng-jfhe9v0j7c-n0x6ozmgo9.pdf'>[Lite Rules]</a>
      </Row>
      <Row>
        <Col className='border p-0'>
          <SituationActions number={1} onCopy={() => setSituation1(copyChoices(situation2, newShootSituation))} onClear={() => setSituation1(newShootSituation())}/>
          <ShootSituation
            attacker={attacker1}
            setAttacker={change1('attacker')}
            defender={defender1}
            setDefender={change1('defender')}
            shootOptions={shootOptions1}
            setShootOptions={change1('options')}
            attackerAdvanced={situation1.attackerAdvanced}
            defenderAdvanced={situation1.defenderAdvanced}
            setAttackerAdvanced={change1('attackerAdvanced')}
            setDefenderAdvanced={change1('defenderAdvanced')}
            saveToDmgToProb={saveToDmgToProb1}
            />
        </Col>
        <Col className='border p-0'>
          <SituationActions number={2} onCopy={() => setSituation2(copyChoices(situation1, newShootSituation))} onClear={() => setSituation2(newShootSituation())}/>
          <ShootSituation
            attacker={attacker2}
            setAttacker={change2('attacker')}
            defender={defender2}
            setDefender={change2('defender')}
            shootOptions={shootOptions2}
            setShootOptions={change2('options')}
            attackerAdvanced={situation2.attackerAdvanced}
            defenderAdvanced={situation2.defenderAdvanced}
            setAttackerAdvanced={change2('attackerAdvanced')}
            setDefenderAdvanced={change2('defenderAdvanced')}
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
