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

const ShootSection: React.FC = () => {
  const [attacker, setAttacker] = React.useState(new Attacker());
  const [defender, setDefender] = React.useState(new Defender());
  const [shootOptions, setShootOptions] = React.useState(new ShootOptions());

  //const damageToProb = calcDmgProbs(attacker, defender, shootOptions);

  const saveToDmgToProb = new Map<number,Map<number,number>>([2, 3, 4, 5, 6].map(save =>
    [save, calcDmgProbs(attacker, defender.withProp('save', save), shootOptions)]));

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
            <li>AvgDamageBounded is the average of damage bounded by the number of the defender's wounds.</li>
            <li>AvgDamageUnbounded is the average of damage without regard to defender's wounds.</li>
            <li>InvulnSave is always used if valid.</li>
            <li>
              Feel No Pain (FNP) refers to the category of abilities where just before damage is actually resolved,
              you roll a die for each potential wound, and each rolled success prevents a wound from being lost.
              Even MWx damage can be prevented via FNP. The
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/death-guard#Plague-Marine-Warrior-">Plague Marine (Warrior)</a>&#x202F;
              ability Disgustingly Resilient is a FNP=5+ ability.
            </li>
            <li>
              "Starfire" refers to
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/tomb-world/#Equipment">Necron Equipment</a>&#x202F;
              Starfire Core, which allows you to transform a failed hit into a normal hit if you had at least one
              critical hit.
            </li>
            <li>
              Balanced and Chitin
              (<a href="https://wahapedia.ru/kill-team2/kill-teams/hive-fleet/#Equipment">Hive Fleet equipment</a> Extended Chitin)
              will only reroll a fail even if would be wise to reroll a normal success.
            </li>
            <li>
              Cover saves can go up to 2 via the
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/hive-fleet#Strategic-Ploys">Hive Fleet strategic ploy</a>&#x202F;
              Lurk and the
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/brood-coven#Strategic-Ploys">Brood Coven strategic ploy</a>&#x202F;
              Lurk In The Shadows.
              
              Lurk In The Shadows and things like Intercession Squad's Stealthy 
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/intercession-squad#Chapter-Tactics">chapter tactic</a>&#x202F;
              have an option for a cover save to be a critical save instead of a normal save.
            </li>
            <li>
              HardyX is like LethalX (changes what values give you a critical success), but for defense.
              For example, the Intercession Squad kill team has a
              &#x202F;<a href="https://wahapedia.ru/kill-team2/kill-teams/intercession-squad#Chapter-Tactics">chapter tactic</a>&#x202F;
              Hardy that would be considered HardyX=5+; defense rolls of 5s and 6s would be critical saves.
            </li>
            <li>
              FireTeamRules refers to whether to use the hit-cancellation rules from
              &#x202F;<a href="https://warhammer40000.com/fireteam/">Warhammer 40,000 Fire Team</a>&#x202F;
              (very similar to Kill Team, but simpler)
              where any successful save can cancel any successful hit, but all normal hits must be cancelled before
              cancelling any critical hit.  You can download the
              &#x202F;<a href="https://warhammer40000.com/wp-content/uploads/2021/08/0Yw56ts8yOI2YO4I.pdf">rules</a>&#x202F;
              and look at p8-9 for how attack actions work, specifically step4 on p9.
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default ShootSection;