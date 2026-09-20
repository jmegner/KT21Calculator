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
import {Situation, newDeadzoneSituation} from './Situation';
import { deadzoneNotes } from 'src/Deadzone/Notes';
import { useStoredState } from 'src/hooks/useStoredState';
import { copyChoices } from 'src/ChoiceStorage';
import { SituationActions } from 'src/components/SectionActions';

export const DeadzoneSection: FC<{isHaloFlashpoint?: boolean}> = ({isHaloFlashpoint = false}) => {
  const defaults = () => newDeadzoneSituation(isHaloFlashpoint);
  const key = isHaloFlashpoint ? 'halo' : 'deadzone';
  const [situation1, setSituation1] = useStoredState(key + '.s1', defaults);
  const [situation2, setSituation2] = useStoredState(key + '.s2', defaults);
  const noteListItems: JSX.Element[] = [
    N.AvgDamageUnbounded,
    ...deadzoneNotes(isHaloFlashpoint),
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
          <SituationActions number={1} onCopy={() => setSituation1(copyChoices(situation2, defaults))} onClear={() => setSituation1(defaults())}/>
          <Situation state={situation1} onChange={setSituation1}/>
        </Col>
        <Col className='border p-0'>
          <SituationActions number={2} onCopy={() => setSituation2(copyChoices(situation1, defaults))} onClear={() => setSituation2(defaults())}/>
          <Situation state={situation2} onChange={setSituation2}/>
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
              <li><b>Modifiers</b>: Enabled special rules always apply. Turn off Optics, Sniper Scope and Guarded for Assault. Do not also add their bonuses to Dice or Headshots. Enter all applicable rerolls in Rerolls/WeightOfFire. Other terrain and command modifiers remain manual.</li>
              <li><b>Scope</b>: Ordinary Shoot/Assault damage only. Special attack resolution (including Blaze Away, EMP, Sticky, explosions, and Continuous Fire self-damage) and item effects are not simulated.</li>
            </>}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};
