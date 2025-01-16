import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilmRow from './FilmRow';
import { Loader2 } from 'lucide-react';
import { filmService } from '../utils/api';

const Home = () => {
  const [recentlyReleased, setRecentlyReleased] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllFilms = async () => {
      try {
        setIsLoading(true);

        const [popularResult, releasedResult, addedResult] = await Promise.allSettled([
          filmService.getPopularFilms(),
          filmService.getRecentlyReleasedFilms(),
          filmService.getRecentlyAddedFilms(),
        ]);

        if (popularResult.status === 'fulfilled') {
          setPopularFilms(popularResult.value);
        } else {
          setErrors((prev) => ({ ...prev, popular: 'Erreur lors du chargement des films populaires' }));
        }

        if (releasedResult.status === 'fulfilled') {
          setRecentlyReleased(releasedResult.value);
        } else {
          setErrors((prev) => ({ ...prev, released: 'Erreur lors du chargement des sorties récentes' }));
        }

        if (addedResult.status === 'fulfilled') {
          setRecentlyAdded(addedResult.value);
        } else {
          setErrors((prev) => ({ ...prev, added: 'Erreur lors du chargement des derniers ajouts' }));
        }
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setErrors((prev) => ({ ...prev, global: 'Une erreur inattendue est survenue.' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFilms();
  }, []);

  const handleFilmClick = (filmId) => {
    navigate(`/film/${filmId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Section Films Populaires */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Films populaires</h2>
          {errors.popular ? (
            <div className="text-red-500 mb-4">{errors.popular}</div>
          ) : (
            <FilmRow films={popularFilms} onFilmClick={handleFilmClick} />
          )}
        </section>

        {/* Section Sorties Récentes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Sorties récentes</h2>
          {errors.released ? (
            <div className="text-red-500 mb-4">{errors.released}</div>
          ) : (
            <FilmRow films={recentlyReleased} onFilmClick={handleFilmClick} />
          )}
        </section>

        {/* Section Derniers Ajouts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Derniers ajouts</h2>
          {errors.added ? (
            <div className="text-red-500 mb-4">{errors.added}</div>
          ) : (
            <FilmRow films={recentlyAdded} onFilmClick={handleFilmClick} />
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
