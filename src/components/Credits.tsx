import React from 'react';

export interface Props {
}

const Credits: React.FC<Props> = (props: Props) => {
  return (
    <p>
      <a href="https://github.com/jmegner/KT21Calculator">GitHub source code repository</a> <br />
      Authored by <a href="https://github.com/jmegner">Jacob Egner</a>.<br />
      Inspired by <a href="https://github.com/ramainen">Damir Fakhrutdinov</a>'s Monte-Carlo-based <a href="http://kt2.doit-cms.ru/">Kill Team Simulator 2</a>.<br />
    </p>
  );
}

export default Credits;