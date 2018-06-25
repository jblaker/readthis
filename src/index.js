import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
//import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';

render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('root')
);
//registerServiceWorker();
unregister();
