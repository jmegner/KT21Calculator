import React from 'react';

export interface Props {
  showInspiration?: boolean;
}

const Credits: React.FC<Props> = (props: Props) => {
  return (
    <p>
      <a href="https://github.com/jmegner/KT21Calculator">GitHub source code repository</a><br/>
      Feature requests and bug reports can be <a href="https://github.com/jmegner/KT21Calculator/issues">made here</a>.<br/>
      Authored by <a href="https://github.com/jmegner">Jacob Egner</a>.<br/>
      My thanks for code contributions by <a href="https://github.com/veddermatic">Dave/veddermatic</a> and <a href='https://github.com/daespinozah'>Daniel Espinoza-Hernandez</a>.<br/>
      {props.showInspiration && <>Inspired by <a href="https://github.com/ramainen">Damir Fakhrutdinov</a>'s Monte-Carlo-based <a href="http://kt2.doit-cms.ru/">Kill Team Simulator 2</a>.<br/></>}
    </p>
  );
}

export default Credits;