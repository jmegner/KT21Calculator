//import React from 'react';
//import TestLib, { fireEvent, render } from '@testing-library/react';
import TestLib from '@testing-library/react';

import App from './App';

//type RenderResult = TestLib.RenderResult<typeof TestLib.queries, HTMLElement>;

it('app renders without crashing', () => {
  TestLib.render(<App />);
});

