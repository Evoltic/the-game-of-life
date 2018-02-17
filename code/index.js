import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TheGameOfLife from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<TheGameOfLife />, document.getElementById('root'));
registerServiceWorker();
