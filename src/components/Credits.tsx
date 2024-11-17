import React from 'react';

export interface Props {
  showInspiration?: boolean;
}

const Credits: React.FC<Props> = (props: Props) => {
  return (
    <p>
      <a href="https://github.com/jmegner/KT21Calculator">GitHub source code repository</a><br/>
      Feature requests and bug reports can be <a href="https://github.com/jmegner/KT21Calculator/issues">made here</a> or say something in Command Point's <a href='https://discord.com/channels/693216170194501704/1209168131419807814'>kill-team-math discord channel</a> (<a href='https://discord.gg/mHRVe22qDP'>invite</a>).<br/>
      Authored by <a href="https://github.com/jmegner">Jacob Egner</a>.<br/>
      My thanks for code contributions by <a href="https://github.com/veddermatic">Dave/veddermatic</a>, <a href='https://github.com/daespinozah'>Daniel Espinoza-Hernandez</a>, and <a href='https://github.com/DenamPavel'>Kevin/Sigma</a>.<br/>
      {props.showInspiration && <>Inspired by <a href="https://github.com/ramainen">Damir Fakhrutdinov</a>'s Monte-Carlo-based <a href="http://kt2.doit-cms.ru/">Kill Team Simulator 2</a>.<br/></>}
    </p>
  );
}

export default Credits;