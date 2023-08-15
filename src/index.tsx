import React from 'react';
import ReactDOM from 'react-dom'
import 'mapbox-gl/dist/mapbox-gl.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css'


const Main = () => (
  <Router>
    <Routes>
    <Route path="/" element={<App />} />
    </Routes>
  </Router>
);

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);
