// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import FilmDetails from './components/FilmDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/film/:id" element={<FilmDetails />} />
      </Routes>
    </Router>
  );
}

export default App;