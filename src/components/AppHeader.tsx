import "src/components/AppHeader.css"
import { Calculator } from 'src/types';
import meleeIcon from 'src/meleeIcon.svg';
import shootIcon from 'src/shootIcon.svg';

type AppHeaderProps = {
  currentView: Calculator;
  navCallback: (navType: Calculator) => void;
}

// NOTE: the 'type' and 'name' on the buttons are for ac11y reasons
const AppHeader = (props: AppHeaderProps) => (
  <nav className='AppHeader'>
          <button
            type="button"
            name="Shooting Calculator"
            disabled={props.currentView === Calculator.SHOOT}
            onClick={() => props.navCallback( Calculator.SHOOT)}>
            <img src={shootIcon} alt="Killzone Ranged Weapon Icon" />
          </button>
          <button
            type="button"
            name="Fight Calculator"
            disabled={props.currentView === Calculator.FIGHT}
            onClick={() => props.navCallback( Calculator.FIGHT)}>
            <img src={meleeIcon} alt="Killzone Melee Weapon Icon" />
          </button>
  </nav>
);
export default AppHeader