import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import FilmDetails from './components/FilmDetails';
import BookDetails from './components/BookDetails';
import GameDetails from './components/GameDetails';
import ArtistDetails from './components/ArtistDetails';
import AlbumDetails from './components/AlbumDetails';
import TrackDetails from './components/TrackDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/film/:id" element={<FilmDetails />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route path="/artist/:id" element={<ArtistDetails />} />
        <Route path="/album/:id" element={<AlbumDetails />} />
        <Route path="/track/:id" element={<TrackDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
