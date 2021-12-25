import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from './IncDecSelect';
import * as Util from '../Util';
import {
  acceptNumToAcceptString as fromNum
} from '../Util';

export interface Props {
  rounds: number;
  roundsChangeHandler: Util.Accepter<number>;
}

const CalcControls: React.FC<Props> = (props: Props) => {
  const roundsId = 'Rounds';

  const params: IncProps[] = [
    //           id,       selectedValue,values,          valueChangeHandler
    new IncProps(roundsId, props.rounds, Util.span(1, 9), fromNum(props.roundsChangeHandler)),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '320px'}}>
      <Row>General</Row>
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

export default CalcControls;