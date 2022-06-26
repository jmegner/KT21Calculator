import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import Situation from './Situation';

const WorldOfTanksSection: React.FC = () => {
  return (
    <Container style={{width: '900px'}}>
      <Row>
        <a href='https://www.gf9games.com/worldoftanks/'>World Of Tanks</a>
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
      <Row>
        <Col className='border' style={{fontSize: '11px'}}>
          Notes:
          <ul>
            <li>AvgDamageBounded is the average of damage bounded by the number of the defender's wounds.</li>
            <li>AvgDamageUnbounded is the average of damage without regard to defender's wounds.</li>
            <li>HitsToCrits examples: Big Gun, Binocular Telescope (while Stationary), Eagle Eye (don't forget to decrease attack dice), Spall Liner, Preventative Maintenance</li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default WorldOfTanksSection;