import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import _ from 'lodash';

import IncDecSelect from './IncDecSelect';
import Util from '../Util';

interface Props {
}

const DefenderControls: React.FC<Props> = (props: Props) => {
  const [save, setSave] = React.useState(3);
  const [defense, setDefense] = React.useState(3);
  const [wounds, setWounds] = React.useState(12);
  const [fnp, setFnp] = React.useState(0);
  const [invulnSave, setInvulnSave] = React.useState(0);
  const [cover, setCover] = React.useState(false);
  const [chitin, setChitin] = React.useState(false);

  const saveId = 'Save';
  const defenseId = 'Defense';
  const woundsId = 'Wounds';
  const fnpId = 'FNP (Feel No Pain)';
  const invulnSaveId = 'Invulnerable Save';
  const coverId = 'Cover (1 autosuccess)';
  const chitinId = 'Extended Chitin';

  const fromNum = Util.acceptNumToAcceptString;
  const fromBool = Util.acceptBoolToAcceptString;

  const params: [string, number | string, string[], (x: string) => void][] = [
    // id, selectedValue, values, suffix, valueChangeHandler
    [saveId, save + '+', Util.rollSpan, fromNum(setSave)],
    [defenseId, defense, Util.span(0, 3), fromNum(setDefense)],
    [woundsId, wounds, _.concat(Util.span(1, 18), ['99']), fromNum(setWounds)],
    [fnpId, fnp + '+', Util.span(3, 6, '+'), fromNum(setFnp)],
    [invulnSaveId, invulnSave + '+', Util.xrollSpan, fromNum(setInvulnSave)],
    [coverId, Util.boolToCheckX(cover), Util.xAndCheck, fromBool(setCover)],
    [chitinId, Util.boolToCheckX(chitin), Util.xAndCheck, fromBool(setChitin)],
  ];

  const paramElems = params.map(p => <Row key={p[0]}><Col className='pr-0'><IncDecSelect
     id={p[0]}
     selectedValue={p[1]}
     values={p[2]}
     valueChangeHandler={p[3]}
     /></Col></Row>);

  return (
    <Container style={{width: '320px'}}>
      <Row>Defender</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElems}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default DefenderControls;