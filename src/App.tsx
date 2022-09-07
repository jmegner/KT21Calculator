import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import * as Util from 'src/Util';
import AppHeader from "src/components/AppHeader";
import ShootSection from 'src/components/ShootSection';
import FightSection from 'src/components/FightSection';
import { CalculatorViewChoice } from 'src/CalculatorViewChoice';
import WorldOfTanksSection from './components/WorldOfTanks/WorldOfTanksSection';

const App = () => {
  const [currentView, setCurrentView] = useState<CalculatorViewChoice>(CalculatorViewChoice.KtShoot);
  const [urlParams, setUrlParams] = useSearchParams();
  const [urlQueryActedOn, setUrlQueryActedOn] = useState<string>("");

  useEffect( () => {
    if(urlQueryActedOn === urlParams.toString()) {
      return;
    }

    setUrlQueryActedOn(urlParams.toString());

    const viewText = urlParams.get('view')
    if(viewText !== null) {
      const viewChoice = CalculatorViewChoice[viewText as keyof typeof CalculatorViewChoice];
      if(viewChoice !== undefined) {
        setCurrentView(viewChoice);
      }
    }

  });

  function sectionDiv(
    view: CalculatorViewChoice,
    child: JSX.Element,
  ) : JSX.Element {
    return (
      <div style={{ display: currentView === view ? 'block' : 'none' }}>
        {child}
      </div>
    );
  }

  return (
    <>
      <AppHeader navCallback={setCurrentView} currentView={currentView} />
        <Row>
          <Col className={Util.centerHoriz + ' p-0'} style={{fontSize: '11px'}}>
            Starred (*) items have explanations in hovertext and 'Notes' at bottom.
          </Col>
        </Row>
        <Row>
          <Col>
            {sectionDiv(CalculatorViewChoice.KtShoot, <ShootSection/>)}
            {sectionDiv(CalculatorViewChoice.KtFight, <FightSection/>)}
            {sectionDiv(CalculatorViewChoice.WorldOfTanks, <WorldOfTanksSection/>)}
          </Col>
        </Row>
    </>
  );
};

export default App;