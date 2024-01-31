import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import Situation from './Situation';
import * as N from 'src/Notes';

const WorldOfTanksSection: React.FC = () => {
  const noteListItems: JSX.Element[] = [
    N.Deadeye,
    N.HighExplosive,
    N.TargetHullDown,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: 'fit-content'}}>
      <Row>
        <a href='https://www.gf9games.com/worldoftanks/'>World Of Tanks Miniatures Game</a>
        &#x202F;(<a href='https://www.gf9games.com/worldoftanks/wp-content/uploads/2020/06/WOT-Rulebook-FINAL-Small.pdf'>Rules PDF</a>)
      </Row>
      <Row>
        <Col className='border'>
          Situation1
          <Situation/>
        </Col>
        <Col className='border'>
          Situation2
          <Situation/>
        </Col>
      </Row>
      <Row>
        <Col className={Util.centerHoriz + ' border'} style={{fontSize: '11px'}}>
          <Credits/>
        </Col>
      </Row>
      <Row style={{width: '700px'}}>
        <Col className='border' style={{fontSize: '11px'}}>
          Notes:
          <ul>
            <li><b>AvgDamageUnbounded</b> is the average of damage without being limited by the number of the defender's wounds.</li>
            <li><b>HitsToCrits</b> examples: Big Gun, Binocular Telescope (while Stationary), Eagle Eye (don't forget to decrease attack dice), Spall Liner, Preventative Maintenance</li>
            {noteListItems}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default WorldOfTanksSection;