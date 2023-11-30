import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from 'src/App';
import init from 'dice_sim';

import 'bootstrap/dist/css/bootstrap.min.css';

/*
https://www.joshfinnie.com/blog/using-webassembly-created-in-rust-for-fast-react-components/
above linked post suggests doing something like this ...
  import init from 'your-wasm-package';
  init().then((wasm) => {
    doSomething(wasm.some_wasm_function_you_wrote_in_rust());
    ReactDOM.render(<App />, document.getElementById('root'));
  });

  So, the "whole react thing" of ReactDOM.render() is inside the .then() continuation of initing wasm
  and that appears to make sure everything in the app is done after wasm initialization is done.
*/

init().then((wasm) => {
  ReactDOM.render(
    <StrictMode>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
  );
});
