import React from 'react';
import { Col, Row } from 'react-bootstrap';

import AppHeader from "src/components/AppHeader";
import ShootSection from 'src/components/ShootSection';
import FightSection from 'src/components/FightSection';
import { CalculatorViewChoice } from 'src/CalculatorViewChoice';

const App = () => {
  const [currentView, setCurrentView] = React.useState<CalculatorViewChoice>(CalculatorViewChoice.Shoot);

  return (
    <>
      <AppHeader navCallback={setCurrentView} currentView={currentView} />
        <Row>
          <Col>
            <div style={{ display: currentView === CalculatorViewChoice.Shoot ? 'block' : 'none'}}>
              <ShootSection/>
            </div>
            <div style={{ display: currentView === CalculatorViewChoice.Fight ? 'block' : 'none'}}>
              <FightSection />
            </div>
          </Col>
        </Row>
    </>
  );
};

export default App;