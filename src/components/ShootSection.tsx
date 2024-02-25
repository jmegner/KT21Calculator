import React, { useState } from 'react';
import {
  Col,
  Container,
  Row,
  Carousel
} from 'react-bootstrap';


import ShootOptions from 'src/ShootOptions';
import AttackerControls from "src/components/AttackerControls";
import DefenderControls from "src/components/DefenderControls";
import ShootOptionControls from 'src/components/ShootOptionControls';
import ShootResultsDisplay from 'src/components/ShootResultsDisplay';
import Credits from 'src/components/Credits';

import Model from 'src/Model';
import { calcDmgProbs } from 'src/CalcEngineShoot';
import * as N from 'src/Notes';
import { SaveRange } from 'src/KtMisc';
import { ShootSituation } from './ShootSituation';
import 'src/components/ShootSection.css'

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
    <Container fluid = "sm">
      <h4 style={{textAlign:'center'}}>
        Kill Team 2021 Edition, Shooting
        <a href='https://www.warhammer-community.com/wp-content/uploads/2022/08/ekD0GG2pTHlYba0G.pdf'>[Lite Rules]</a>
      </h4>
      <div className='d-none d-sm-block'>
        <Row className='justify-content-md-center'>
          <Col lg={4} md={6} className='p-0'>
            <h2 style={{textAlign:'center'}}>Situation 1</h2>
            <ShootSituation/>
          </Col>
          <Col lg={4} md={6} className="p-0">
            <h2 style={{textAlign:'center'}}>Situation 2</h2>
            <ShootSituation/>
          </Col>
        </Row>
      </div>
      <div className='d-sm-none'>
        <Carousel touch indicators={false} controls={false} interval={null}>
          <Carousel.Item>
            <h2 style={{textAlign:'center'}}>Situation 1</h2>
            <ShootSituation/>
          </Carousel.Item>
          <Carousel.Item>
            <h2 style={{textAlign:'center'}}>Situation 2</h2>
            <ShootSituation/>
          </Carousel.Item>
        </Carousel>
      </div>
      <Row>
          <Col style={{textAlign: 'center'}}><Credits/></Col>  
        </Row>
        <Row>
          <Col>
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