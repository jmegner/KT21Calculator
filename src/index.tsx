import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import App from 'src/App';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
