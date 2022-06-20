import React from "react";

import "src/components/AppHeader.css"
import { CalculatorViewChoice } from 'src/CalculatorViewChoice';
import ktFightIcon from 'src/images/KtFightIcon.svg';
import ktShootIcon from 'src/images/KtShootIcon.svg';
import wotIcon from 'src/images/WorldOfTanksIcon.svg';

type AppHeaderProps = {
  currentView: CalculatorViewChoice;
  navCallback: (navType: CalculatorViewChoice) => void;
}

// NOTE: the 'type' and 'name' on the buttons are for ac11y reasons
const AppHeader = (props: AppHeaderProps) => {
  function makeButton(
    view: CalculatorViewChoice,
    buttonName: string,
    img: any,
    imgAlt: string,
  ) : React.HTMLProps<HTMLButtonElement> {
    return (
      <button
        type="button"
        name={buttonName}
        disabled={props.currentView === view}
        onClick={() => props.navCallback(view)}
        >
        <img title={buttonName} src={img} alt={imgAlt} width="40" height="40" />
      </button>);
  }

  return <nav className='AppHeader'>
    {makeButton(
      CalculatorViewChoice.KtShoot,
      'Kill Team Shoot Calculator',
      ktShootIcon,
      'Kill Team ranged weapon icon',
    )}
    {makeButton(
      CalculatorViewChoice.KtFight,
      'Kill Team Fight Calculator',
      ktFightIcon,
      'Kill Team melee weapon icon',
    )}
    {makeButton(
      CalculatorViewChoice.WorldOfTanks,
      'World Of Tanks Shoot Calculator',
      wotIcon,
      'World Of Tanks logo',
    )}
  </nav>
};


export default AppHeader;