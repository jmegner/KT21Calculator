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
  return (
    <Container style={{width: '320px'}}>
      <Row>Results</Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmg:
        </Col>
        <Col>
          {props.avgDamage}
        </Col>
      </Row>
    </Container>
  );
}

export default ResultsDisplay;