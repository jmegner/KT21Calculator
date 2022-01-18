# Kill Team 2021 Calculator ("ktcalc")
Calculator for helping analyze shooting and fighting attacks in Kill Team (2021 edition). Heavily inspired by [kt2.doit-cms.ru](http://kt2.doit-cms.ru/) and hoping to improve on it.

Live at [jmegner.github.io/KT21Calculator](https://jmegner.github.io/KT21Calculator/).

[Announcement reddit thread](https://www.reddit.com/r/killteam/comments/rvhme0/kt21_calculator_web_app/)
and
[follow-up thread for fight support](https://www.reddit.com/r/killteam/comments/s5gczq/kt21_calculator_now_supports_fightingmelee/).

Features I plan on implementing...
* have option for user to select a relevant operative profile (ex: Necron Immortal with Gauss Blaster and Starfire Core) instead of individually selecting parameters.
* results tables have checkbox for damage-oriented or remaining-wounds-oriented numbers
* fight section
  * hammerhand
  * multiple rounds
  * fnp

Notable technologies/libs/whatever used... 
* [TypeScript](https://www.typescriptlang.org/)
* [React](https://reactjs.org/)
* [React-Bootstrap](https://react-bootstrap.github.io/)
* [Create-React-App](https://create-react-app.dev/) (but heavily considering using [NextJS](https://nextjs.org/) in future)
* [Jest](https://jestjs.io/)
* [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
* [GitHub Actions](https://docs.github.com/en/actions)
* [Visual Studio Code](https://code.visualstudio.com/)

My thanks to Redux maintainer
[Mark Erikson](https://github.com/markerikson)
for his
[advice and help](https://www.reddit.com/r/reactjs/comments/ropftw/comment/hpzxqrf/?utm_source=reddit&utm_medium=web2x&context=3).
I decided not to use Redux just yet, but look forward to using it.