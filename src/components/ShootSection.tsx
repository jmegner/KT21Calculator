import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import SwipeableViews from "react-swipeable-views"

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import * as N from 'src/Notes';
import { ShootSituation } from './ShootSituation';

const ShootSection: React.FC = () => {
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

  const isTouch = window.ontouchstart !== undefined;
  const safeWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const isNarrow = safeWidth < 768; // meaning too narrow to show both situations side by side
  const shouldUseSwipe = isTouch && isNarrow;

  const situationsRow = shouldUseSwipe
    ?
      <Row>
        <Col className='border p-0'>
          <SwipeableViews>
            <div>
              <h2 className='sticky-top' style={{textAlign:'center'}}>Situation 1</h2>
              <ShootSituation/>
            </div>
            <div>
              <h2 style={{textAlign:'center'}}>Situation 2</h2>
              <ShootSituation/>
            </div>
          </SwipeableViews>
        </Col>
      </Row>
    :
      <Row>
        <Col className='border p-0'>
          <ShootSituation/>
        </Col>
        <Col className='border p-0'>
          <ShootSituation/>
        </Col>
      </Row>
    ;

  return (<>
    {`isTouch: ${isTouch}`}<br/>
    {`width: ${safeWidth}`}<br/>
    {`isNarrow: ${isNarrow}`}<br/>
    {`shouldUseSwipe: ${shouldUseSwipe}`}<br/>
    <Container style={{width: 'fit-content'}}>
      <Row>
        Kill Team 2021 Edition, Shooting&nbsp;
        <a href='https://www.warhammer-community.com/wp-content/uploads/2022/08/ekD0GG2pTHlYba0G.pdf'>[Lite Rules]</a>
      </Row>
      {situationsRow}
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
  </>);
};

export default ShootSection;