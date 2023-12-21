import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import ShootOptions from 'src/ShootOptions';
import * as N from 'src/Notes';
import {
  Accepter,
  boolToCheckX as toCheckX,
  makePropChangeHandlers,
  span,
  xAndCheck,
} from 'src/Util';

export interface Props {
  shootOptions: ShootOptions;
  changeHandler: Accepter<ShootOptions>;
}

const ShootOptionControls: React.FC<Props> = (props: Props) => {
  const opts = props.shootOptions;
  // eslint-disable-next-line
  const [textHandler, numHandler, boolHandler]
    = makePropChangeHandlers(opts, props.changeHandler);

  const params: IncProps[] = [
    //           id,       selectedValue,values,          valueChangeHandler
    new IncProps('Rounds',        opts.numRounds,                 span(1, 9), numHandler('numRounds')),
    new IncProps(N.FireTeamRules, toCheckX(opts.isFireTeamRules), xAndCheck,  boolHandler('isFireTeamRules')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '310px'}}>
      <Row>General</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElems.slice(0, paramElems.length / 2)}
          </Container>
        </Col>
        <Col>
          <Container className='p-0'>
            {paramElems.slice(paramElems.length / 2)}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default ShootOptionControls;