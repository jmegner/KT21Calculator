import React from 'react';
import * as Test from '@testing-library/react';

import App from './App';

// for some reason, "// eslint-disable-next-line no-unused-vars" doesn't work;
// I have to do a eslint-disable-next-line for all rules;
// eslint-disable-next-line
type RenderResult = Test.RenderResult<typeof Test.queries, HTMLElement>;

it('app renders without crashing', () => {
  Test.render(<App />);
});

