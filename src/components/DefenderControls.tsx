import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from './IncDecSelect';
import * as Util from '../Util';
import {
  acceptBoolToAcceptString as fromBool,
  acceptNumToAcceptString as fromNum
} from '../Util';

export interface Props {
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

  const params: IncProps[] = [
    //           id,           selectedValue,             values,                valueChangeHandler
    new IncProps(saveId,       save + '+',                Util.rollSpan,         fromNum(setSave)),
    new IncProps(defenseId,    defense,                   Util.span(0, 4),       fromNum(setDefense)),
    new IncProps(woundsId,     wounds,                    Util.span(1, 19),      fromNum(setWounds)),
    new IncProps(fnpId,        fnp + '+',                 Util.xspan(3, 6, '+'), fromNum(setFnp)),
    new IncProps(invulnSaveId, invulnSave + '+',          Util.xrollSpan,        fromNum(setInvulnSave)),
    new IncProps(coverId,      Util.boolToCheckX(cover),  Util.xAndCheck,        fromBool(setCover)),
    new IncProps(chitinId,     Util.boolToCheckX(chitin), Util.xAndCheck,        fromBool(setChitin)),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

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