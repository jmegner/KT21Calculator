import "src/components/AppHeader.css"
import { CalculatorViewChoice } from 'src/CalculatorViewChoice';
import meleeIcon from 'src/images/MeleeIcon.svg';
import shootIcon from 'src/images/ShootIcon.svg';

type AppHeaderProps = {
  currentView: CalculatorViewChoice;
  navCallback: (navType: CalculatorViewChoice) => void;
}

// NOTE: the 'type' and 'name' on the buttons are for ac11y reasons
const AppHeader = (props: AppHeaderProps) => (
  <nav className='AppHeader'>
          <button
            type="button"
            name="Shooting Calculator"
            disabled={props.currentView === CalculatorViewChoice.Shoot}
            onClick={() => props.navCallback( CalculatorViewChoice.Shoot)}>
            <img title="Shoot" src={shootIcon} alt="Killzone Ranged Weapon Icon" />
          </button>
          <button
            type="button"
            name="Fight Calculator"
            disabled={props.currentView === CalculatorViewChoice.Fight}
            onClick={() => props.navCallback( CalculatorViewChoice.Fight)}>
            <img title="Fight" src={meleeIcon} alt="Killzone Melee Weapon Icon" />
          </button>
  </nav>
);
export default AppHeader