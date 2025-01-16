// FilmRow.js
import React from 'react';

const FilmRow = ({ films, onFilmClick }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 pb-4">
        {films.map((film) => (
          <div
            key={film.film_id}
            className="flex-none w-48 cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => onFilmClick(film.film_id)}
          >
            <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800">
              <img
                src={film.poster_url || '/api/placeholder/192/288'}
                alt={film.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white truncate">
                  {film.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {new Date(film.release_date).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmRow;