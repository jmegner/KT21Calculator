# Kill Team 2021 Calculator ("ktcalc")
Calculator for helping analyze shooting and fighting attacks in Kill Team (2021 edition). Heavily inspired by [kt2.doit-cms.ru](http://kt2.doit-cms.ru/) and hoping to improve on it.

Live at [jmegner.github.io/KT21Calculator](https://jmegner.github.io/KT21Calculator/).

For reference, here's ktcalc's [announcement reddit thread](https://www.reddit.com/r/killteam/comments/rvhme0/kt21_calculator_web_app/)
and
[follow-up thread for fight support](https://www.reddit.com/r/killteam/comments/s5gczq/kt21_calculator_now_supports_fightingmelee/).
Check out [Kill Team Resources](https://github.com/jmegner/KillTeamResources) repo for other calculators/simulators and more.

## Future Work

Features that would be nice for me to get around to implementing ...
* mass analysis tab
* have option for user to select a relevant operative profile (ex: Necron Immortal with Gauss Blaster and Starfire Core) instead of individually selecting parameters.
* shoot section
  * Cult Ambush reroll (you roll attack dice and then choose pip type to reroll, like reroll 2s)
* fight section
  * transition from uninjured to injured (degraded WS) between rounds
  * fnp: this one is messy, so is low priority


## Dev Stuff
Notable technologies/libs/whatever used... 
* [NodeJS and npm](https://nodejs.org/en/)
* [TypeScript](https://www.typescriptlang.org/)
* [React](https://reactjs.org/)
* [React-Bootstrap](https://react-bootstrap.github.io/)
* [Create-React-App](https://create-react-app.dev/) (but heavily considering using [NextJS](https://nextjs.org/) or [Remix](https://remix.run/) in future)
* [Jest](https://jestjs.io/)
* [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
* [GitHub Actions](https://docs.github.com/en/actions)
* [Visual Studio Code](https://code.visualstudio.com/) (VSC)

Dev setup...
* You'll need to install NodeJS+npm for building and running.
* For debugging and otherwise having a nice experience, this project is set up for Visual Studio Code (VSC) as the IDE.
* Initially, you'll have to do a `npm ci` to install npm packages with exact versions of previous development.
* Do a `npm start` to build and run.
* For debugging non-tests with VSC, be sure to do `npm start` before launching the debugger.  For debugging tests, you can just launch one of VSC's test-oriented debug profiles.
* To run tests, do `npm test` for normal watch-mode testing that sticks around.  Do `npm run testq` that does a single run of tests (like doing `test` and then hitting `q` to quit).


## Thanks

My thanks to Redux maintainer
[Mark Erikson](https://github.com/markerikson)
for his
[advice and help](https://www.reddit.com/r/reactjs/comments/ropftw/comment/hpzxqrf/?utm_source=reddit&utm_medium=web2x&context=3).
I decided not to use Redux just yet, but look forward to using it.