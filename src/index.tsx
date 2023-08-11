import React from 'react';
import ReactDOM from 'react-dom'
import 'mapbox-gl/dist/mapbox-gl.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css'

import PaddockInfo from './components/paddockInfo'; // Import your InfoComponent

const Main = () => (
  <Router>
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/info" element={<PaddockInfo />} />
    </Routes>
  </Router>
);

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);
