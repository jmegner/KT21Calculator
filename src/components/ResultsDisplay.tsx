import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export interface Props {
  avgDamage: number;
  avgDamageUnbounded: number;
  killChance: number;
}

const ResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;
  return (
    <Container style={{width: '320px'}}>
      <Row>Results</Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmg:
        </Col>
        <Col>
          {props.avgDamage.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgUnbounded:
        </Col>
        <Col>
          {props.avgDamageUnbounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
    </Container>
  );
}

export default ResultsDisplay;