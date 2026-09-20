import { FC } from 'react';

export const ClearButton: FC<{onClear: () => void}> = ({onClear}) => (
  <button type="button" style={{marginLeft: '4px'}} onClick={onClear}>clear</button>
);

export const SituationActions: FC<{number: 1 | 2; onCopy: () => void; onClear: () => void}> = ({number, onCopy, onClear}) => (
  <div className="d-flex align-items-center">
    Situation{number}
    <button type="button" style={{marginLeft: '4px'}} onClick={onCopy}>copy from S{3 - number}</button>
    <ClearButton onClear={onClear}/>
  </div>
);
