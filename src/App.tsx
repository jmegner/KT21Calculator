import React from 'react';
import { Col, Row } from 'react-bootstrap';

import AppHeader from "src/components/AppHeader";
import ShootSection from 'src/components/ShootSection';
import FightSection from 'src/components/FightSection';
import { Calculator } from 'src/types';

const App = () => {
  const [currentView, setCurrentView] = React.useState<Calculator>(Calculator.SHOOT);

  return (
    <>
      <AppHeader navCallback={setCurrentView} currentView={currentView} />
        <Row>
          <Col>
            <div style={{ display: currentView === Calculator.SHOOT ? 'block' : 'none'}}>
              <ShootSection/>
            </div>
            <div style={{ display: currentView === Calculator.FIGHT ? 'block' : 'none'}}>
              <FightSection />
            </div>
          </Col>
        </Row>
    </>
  );
};

export default App;