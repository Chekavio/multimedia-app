import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarHalf, Star as StarOutline, Clock, Music, Loader2 } from 'lucide-react';
import { musicService } from '../utils/api';

const TrackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        setIsLoading(true);
        const data = await musicService.getTrackDetails(id);
        setTrack(data);
      } catch (error) {
        setError("Impossible de charger les détails du morceau");
        console.error("Error fetching track details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackDetails();
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

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} navigate={navigate} />;
  if (!track) return <NotFound message="Morceau non trouvé" />;

  const duration = `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover du Track (Utilise l'image de l'album si pas d'image de track) */}
          <div className="md:col-span-1">
            <img
              src={track.album?.cover_url || '/api/placeholder/300/300'}
              alt={track.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Informations */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{track.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
              {/* Durée */}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {duration}
              </div>

              {/* Lien vers l'album */}
              {track.album && (
                <button 
                  onClick={() => navigate(`/album/${track.album.album_id}`)}
                  className="flex items-center gap-2 text-blue-400 hover:underline"
                >
                  <Music className="w-4 h-4" />
                  Album : {track.album.title}
                </button>
              )}

              {/* Lien vers l'artiste */}
              {track.artist && (
                <button 
                  onClick={() => navigate(`/artist/${track.artist.artist_id}`)}
                  className="flex items-center gap-2 text-green-400 hover:underline"
                >
                  {track.artist.name}
                </button>
              )}

              {/* Note */}
              <div className="flex items-center gap-1">
                {track.average_rate ? renderStars(track.average_rate) : <StarOutline className="text-gray-400 w-5 h-5" />}
                <span>{track.average_rate || 'Non noté'}</span>
              </div>
            </div>

            {/* Section Avis */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Avis des utilisateurs</h2>
              {track.TrackReviews && track.TrackReviews.length > 0 ? (
                <div className="space-y-4">
                  {track.TrackReviews.map((review, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2">{review.rating}</span>
                      </div>
                      <p className="text-gray-300 mt-2">{review.review_text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Publié le {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Aucun avis pour ce morceau.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Loader pour affichage du chargement */
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

/* Message d'erreur */
const ErrorMessage = ({ message, navigate }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">{message}</h2>
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

/* Message si le morceau n'est pas trouvé */
const NotFound = ({ message }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    {message}
  </div>
);

export default TrackDetails;
