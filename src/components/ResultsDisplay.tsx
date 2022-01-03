import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Defender from '../Defender';

export interface Props {
  defender: Defender;
  damageToProb: Map<number,number>;
}

const ResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;

  let avgDmgUnbounded = 0;
  let avgDmgBounded = 0;
  let killProb = 0;
  const tableBody: JSX.Element[] = [];

  let descendingDmgToProb = new Map<number,number>([...props.damageToProb.entries()].sort((a, b) => a[0] - b[0]).reverse());
  let probAtLeastThisMuchDmg = 0;

  descendingDmgToProb.forEach((prob, dmg) => {
     avgDmgUnbounded += dmg * prob;
     avgDmgBounded += Math.min(dmg, props.defender.wounds) * prob;

     if(dmg >= props.defender.wounds) {
       killProb += prob;
     }

     probAtLeastThisMuchDmg += prob;
     tableBody.push(
      <tr>
        <td>{dmg}</td>
        <td>{(probAtLeastThisMuchDmg * 100).toFixed(digitsPastDecimal)}</td>
        <td>{(prob * 100).toFixed(digitsPastDecimal)}</td>
      </tr>);
  });

  return (
    <Container style={{width: '320px'}}>
      <Row>Results</Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgUnbounded:
        </Col>
        <Col>
          {avgDmgUnbounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgBounded:
        </Col>
        <Col>
          {avgDmgBounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          KillChance:
        </Col>
        <Col>
          {(killProb * 100).toFixed(digitsPastDecimal)}%
        </Col>
      </Row>
      <Row>
        <Col>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <tr>
              <th>Dmg</th>
              <th>p(&gt;=Dmg)<br/>(%)</th>
              <th>p(Dmg)<br/>(%)</th>
            </tr>
            {tableBody.reverse()}
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default ResultsDisplay;