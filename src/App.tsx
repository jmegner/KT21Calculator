import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ErrorBoundary } from 'react-error-boundary';
import { useSearchParams } from 'react-router-dom';

import { CalculatorViewChoice } from 'src/CalculatorViewChoice';
import { centerHoriz, } from 'src/Util';
import AppHeader from "src/components/AppHeader";
import { DeadzoneSection } from 'src/components/Deadzone/DeadzoneSection';
import FightSection from 'src/components/FightSection';
import ShootMassAnalysisSection from 'src/components/ShootMassAnalysisSection';
import ShootSection from 'src/components/ShootSection';
import WorldOfTanksSection from 'src/components/WorldOfTanks/WorldOfTanksSection';
import { useStoredState } from 'src/hooks/useStoredState';

const _viewToAdditionalTexts: Map<CalculatorViewChoice, string[]> = new Map([
  [CalculatorViewChoice.KtShoot, ['shoot']],
  [CalculatorViewChoice.KtFight, ['fight']],
  [CalculatorViewChoice.KtShootMassAnalysis, ['mass']],
  [CalculatorViewChoice.WorldOfTanks, ['wot']],
  [CalculatorViewChoice.Deadzone, ['dz']],
  [CalculatorViewChoice.HaloFlashpoint, ['halo', 'flashpoint']],
]);

const _textToView = new Map<string,CalculatorViewChoice>();
for(const [view, texts] of _viewToAdditionalTexts) {
  _textToView.set(view, view);
  _textToView.set(view.toLowerCase(), view);
  for(const text of texts) {
    _textToView.set(text, view);
  }
}

function fallbackRender({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const App = () => {
  const [savedView, setCurrentView] = useStoredState<CalculatorViewChoice>('view', () => CalculatorViewChoice.KtShoot);
  const currentView = _viewToAdditionalTexts.has(savedView) ? savedView : CalculatorViewChoice.KtShoot;
  const [urlParams, setUrlParams] = useSearchParams();

  function navigate(view: CalculatorViewChoice) {
    setCurrentView(view);
    const params = new URLSearchParams(urlParams);
    params.set('view', view);
    setUrlParams(params, {replace: true});
  }

  useEffect( () => {
    const viewText = urlParams.get('view')
    if(viewText !== null) {
      const chosenView = _textToView.get(viewText);
      if(chosenView !== undefined) {
        setCurrentView(chosenView);
      }
    }
  },
  [urlParams, setCurrentView]);

  function sectionDiv(
    view: CalculatorViewChoice,
    child: JSX.Element,
  ) : JSX.Element {
    return (
      <ErrorBoundary fallbackRender={fallbackRender}>
        <div style={{ display: currentView === view ? 'block' : 'none' }}>
          {child}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <AppHeader navCallback={navigate} currentView={currentView} />
        <Container>
          <Row>
            <Col className={centerHoriz + ' p-0'} style={{fontSize: '11px'}}>
              Starred (*) items have explanations in hovertext and 'Notes' at bottom.
            </Col>
          </Row>
          <Row>
            <Col>
              {sectionDiv(CalculatorViewChoice.KtShoot, <ShootSection/>)}
              {sectionDiv(CalculatorViewChoice.KtFight, <FightSection/>)}
              {sectionDiv(CalculatorViewChoice.KtShootMassAnalysis, <ShootMassAnalysisSection/>)}
              {sectionDiv(CalculatorViewChoice.WorldOfTanks, <WorldOfTanksSection/>)}
              {sectionDiv(CalculatorViewChoice.Deadzone, <DeadzoneSection/>)}
              {sectionDiv(CalculatorViewChoice.HaloFlashpoint, <DeadzoneSection isHaloFlashpoint/>)}
            </Col>
          </Row>
        </Container>
    </>
  );
};

export default App;
