import {
  FC,
} from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Credits from 'src/components/Credits';

import * as Util from "src/Util";
import * as N from 'src/Notes';
import {Situation} from './Situation';

export const DeadzoneSection: FC<{isHaloFlashpoint?: boolean}> = ({isHaloFlashpoint = false}) => {
  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
  ].map(note => <li key={note.name}><b>{note.name}</b>: {note.description}</li>);

  return (
    <Container style={{width: '750px'}}>
      <Row>
        {isHaloFlashpoint ? 'Halo: Flashpoint' : 'Deadzone, Third Edition'}&nbsp;
        <a href={isHaloFlashpoint
          ? 'https://haloflashpoint.manticgames.com/the-app/halo-flashpoint-rules/'
          : 'https://companion.manticgames.com/deadzone-rules/'}>[Rules]</a>&nbsp;
        <a href={isHaloFlashpoint
          ? 'https://www.orderofgamers.com/downloads/HaloFlashpoint_v2.5.pdf'
          : 'https://www.orderofgamers.com/downloads/DeadzoneThirdEdition_v1.4.pdf'}>[Reference]</a>
      </Row>
      <Row >
        <Col className='border p-0'>
          Situation1
          <Situation isHaloFlashpoint={isHaloFlashpoint}/>
        </Col>
        <Col className='border p-0'>
          Situation2
          <Situation isHaloFlashpoint={isHaloFlashpoint}/>
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
            {noteListItems}
            {isHaloFlashpoint && <>
              <li><b>Tests</b>: Use Ranged for Shoot or Fight for Assault; the defender uses Survive. There is no fight back.</li>
              <li><b>Modifiers</b>: Enter the final dice pool and rerolls, including terrain, command dice and abilities such as Smash or Weight of Fire.</li>
              <li><b>Headshots</b>: Exploding dice. Use 7+ for Optics (+1 die) or a long Sniper Scope shot (+2 dice). Against Guarded, disable the shooter's headshots only.</li>
              <li><b>Shields and damage</b>: Enter charged shields, including any applicable barrier. ESD depletes shields before hits; remaining shields block hits before armour. Lethal adds wounds only if damage gets through.</li>
              <li><b>Attacks</b>: Repeated attacks with fixed stats; shields deplete between attacks. No regeneration, healing, respawns or automatic modifier changes. Damage remains unbounded by Health.</li>
              <li><b>Scope</b>: Ordinary Shoot/Assault damage only. Special attack resolution (including Blaze Away, EMP, Sticky, explosions, and Continuous Fire self-damage) and item effects are not simulated.</li>
            </>}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};
