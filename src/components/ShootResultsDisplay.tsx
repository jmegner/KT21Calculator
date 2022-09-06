import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import Defender from 'src/Defender';
import { toAscendingMap, weightedAverage, killProb, } from 'src/Util';

export interface Props {
  defender: Defender;
  //damageToProb: Map<number,number>;
  saveToDmgToProb: Map<number,Map<number,number>>;
}

const ShootResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;
  const toPercentString = (val: number) => (val * 100).toFixed(digitsPastDecimal);

  const saveToAvgDmgTableBody: JSX.Element[] = [];
  const saveToKillChanceTableBody: JSX.Element[] = [];
  const saveToTypicalWounds = new Map<number,Array<number>>([
    [2, [19, 18]],
    [3, [ 15, 14, 13, 12, 11]],
    [4, [9, 8, 7]],
    [5, [9, 8, 7]],
    [6, [3]],
  ]);

  for(const [save, dmgToProb] of props.saveToDmgToProb.entries()) {
    const avgDmg = weightedAverage(dmgToProb);

    saveToAvgDmgTableBody.push(
      <tr key={`AvgDmg_${save}`}>
        <td>{save}+</td>
        <td>{avgDmg.toFixed(digitsPastDecimal)}</td>
      </tr>
    );

    for(const wounds of saveToTypicalWounds.get(save)!) {
      const killChance = killProb(dmgToProb, wounds);

      saveToKillChanceTableBody.push(
        <tr key={`KillChance_${save}_${wounds}`}>
          <td>{save}+</td>
          <td>{wounds}</td>
          <td>{toPercentString(killChance)}%</td>
        </tr>
      );
    }
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
          {toPercentString(killChance)}%
        </Col>
      </Row>
      <Row>
        <Col>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Sv</th>
                <th>AvgDmg</th>
              </tr>
            </thead>
            <tbody>
              {saveToAvgDmgTableBody}
            </tbody>
          </Table>
        </Col>
        <Col>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Sv</th>
                <th>Wounds</th>
                <th>KillChance</th>
              </tr>
            </thead>
            <tbody>
              {saveToKillChanceTableBody}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
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