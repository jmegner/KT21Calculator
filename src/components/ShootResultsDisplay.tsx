import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import Defender from 'src/Defender';
import { toAscendingMap, weightedAverage, killProb, standardDeviation, } from 'src/Util';
import { range } from 'lodash';

export interface Props {
  defender: Defender;
  //damageToProb: Map<number,number>;
  saveToDmgToProb: Map<number,Map<number,number>>;
}

const ShootResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;
  const toPercentString = (val: number) => (val * 100).toFixed(digitsPastDecimal);

  const saveToAvgDmgTableBody: JSX.Element[] = [];
  const killChanceTableBody: JSX.Element[] = [];

  for(const wounds of range(1, 20)) {
    const killChances: number[] = [];

    for(const save of range(2, 6)) {
      killChances.push(killProb(props.saveToDmgToProb.get(save)!, wounds));
    }

    killChanceTableBody.push(
      <tr key={`KillChance_${wounds}`}>
        <td>{wounds}</td>
        {killChances.map(killChance => <td>{toPercentString(killChance)}%</td>)}
      </tr>
    );
  }

  for(const [save, dmgToProb] of props.saveToDmgToProb.entries()) {
    const avgDmg = weightedAverage(dmgToProb);
    const stdDev = standardDeviation(dmgToProb);

    saveToAvgDmgTableBody.push(
      <tr key={`AvgDmg_${save}`}>
        <td>{save}+</td>
        <td>{avgDmg.toFixed(digitsPastDecimal)}</td>
        <td>{stdDev.toFixed(digitsPastDecimal)}</td>
      </tr>
    );
  }

  let avgDmgUnbounded = 0;
  let avgDmgBounded = 0;
  const dmgProbTableBody: JSX.Element[] = [];

  const chosenSaveDmgToProb = props.saveToDmgToProb.get(props.defender.save)!;
  const killChance = killProb(chosenSaveDmgToProb, props.defender.wounds);
  let ascendingDmgToProb = toAscendingMap(chosenSaveDmgToProb);
  let probCumulative = 0;

  ascendingDmgToProb.forEach((prob, dmg) => {
     avgDmgUnbounded += dmg * prob;
     avgDmgBounded += Math.min(dmg, props.defender.wounds) * prob;

     const probAtLeastThisMuchDmg = 1 - probCumulative;
     probCumulative += prob;
     const probAtMostThisMuchDmg = probCumulative;

     dmgProbTableBody.push(
      <tr key={dmg}>
        <td>{dmg}</td>
        <td>{toPercentString(probAtLeastThisMuchDmg)}</td>
        <td>{toPercentString(probAtMostThisMuchDmg)}</td>
        <td>{toPercentString(prob)}</td>
      </tr>
    );
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
      {/*
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgBounded:
        </Col>
        <Col>
          {avgDmgBounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      */}
      <Row>
        <Col style={{fontSize: '11px'}}>
          KillChance:
        </Col>
        <Col>
          {toPercentString(killChance)}%
        </Col>
        <br/>
      </Row>
      <Row>
        <Col>
          <span style={{fontSize: '13px'}}>AvgDmg for various Sv...</span>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Sv</th>
                <th>AvgDmg</th>
                <th>StdDev</th>
              </tr>
            </thead>
            <tbody>
              {saveToAvgDmgTableBody}
            </tbody>
          </Table>
        </Col>
        <Col>
          <span style={{fontSize: '13px'}}>KillChances for various Sv&amp;W...</span>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Wounds</th>
                <th>Sv=2+</th>
                <th>Sv=3+</th>
                <th>Sv=4+</th>
                <th>Sv=5+</th>
              </tr>
            </thead>
            <tbody>
              {killChanceTableBody}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <span style={{fontSize: '13px'}}>Dmg probs for exact scenario...</span>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Dmg</th>
                <th>p(&gt;=Dmg)<br />(%)</th>
                <th>p(&lt;=Dmg)<br />(%)</th>
                <th>p(Dmg)<br />(%)</th>
              </tr>
            </thead>
            <tbody>
              {dmgProbTableBody}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default ShootResultsDisplay;