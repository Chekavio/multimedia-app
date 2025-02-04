import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, StarHalf, Star as StarOutline, Clock, User2, Loader2, ArrowLeft } from 'lucide-react';
import { filmService } from '../utils/api';

const FilmDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        setIsLoading(true);
        const data = await filmService.getFilmDetails(id);
        setFilm(data);
      } catch (error) {
        setError('Impossible de charger les détails du film');
        console.error('Error fetching film details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilmDetails();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} className="text-yellow-400 w-5 h-5" />);
      } else if (i - rating < 1) {
        stars.push(<StarHalf key={i} className="text-yellow-400 w-5 h-5" />);
      } else {
        stars.push(<StarOutline key={i} className="text-gray-400 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Film non trouvé
      </div>
    );
  }

  const averageRating = film.FilmReviews && film.FilmReviews.length > 0
    ? (
        film.FilmReviews.reduce((sum, review) => sum + parseFloat(review.rating), 0) /
        film.FilmReviews.length
      ).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <img
              src={film.poster_url || '/api/placeholder/300/450'}
              alt={film.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Informations */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{film.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
              {film.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {film.duration} min
                </div>
              )}
              {film.director && (
                <div className="flex items-center">
                  <User2 className="w-4 h-4 mr-2" />
                  {film.director}
                </div>
              )}
              <div className="flex items-center gap-1">
                {averageRating ? renderStars(averageRating) : <StarOutline className="text-gray-400 w-5 h-5" />}
                <span>{averageRating || 'Non noté'}</span>
              </div>
            </div>

            {film.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                <p className="text-gray-300">{film.description}</p>
              </div>
            )}

            {film.casting && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Casting</h2>
                <p className="text-gray-300">{film.casting}</p>
              </div>
            )}

            {film.genres && film.genres.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {film.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Avis des utilisateurs</h2>
          {film.FilmReviews && film.FilmReviews.length > 0 ? (
            <div className="space-y-4">
              {film.FilmReviews.map((review, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* 🔥 Image de profil */}
                    <img 
                      src={review.User?.profile_picture || '/api/placeholder/50/50'} 
                      alt={review.User?.username || 'Utilisateur inconnu'} 
                      className="w-10 h-10 rounded-full"
                    />
                    {/* 🔥 Username & étoiles sur la même ligne */}
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-200">{review.User?.username || 'Utilisateur inconnu'}</p>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>

                  </div>
                  <p className="text-gray-300 mt-2">{review.review_text}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Publié le {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucun avis pour ce film.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilmDetails;
