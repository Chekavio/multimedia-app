import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarHalf, Star as StarOutline, Music, Disc, Loader2 } from 'lucide-react';
import { musicService } from '../utils/api';
import { MediaSection, MediaCard } from './media';

const ArtistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        setIsLoading(true);
        const data = await musicService.getArtistDetails(id);
        setArtist(data);
      } catch (error) {
        setError("Impossible de charger les détails de l'artiste");
        console.error("Error fetching artist details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistDetails();
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
  if (!artist) return <NotFound message="Artiste non trouvé" />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image de l'artiste */}
          <div className="md:col-span-1">
            <img
              src={artist.image_url || '/api/placeholder/300/300'}
              alt={artist.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Infos de l'artiste */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{artist.name}</h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
              {/* Genres */}
              {artist.genres && artist.genres.length > 0 && (
                <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                  {artist.genres.join(', ')}
                </span>
              )}

              {/* Note moyenne */}
              <div className="flex items-center gap-1">
                {artist.average_rate ? renderStars(artist.average_rate) : <StarOutline className="text-gray-400 w-5 h-5" />}
                <span>{artist.average_rate || 'Non noté'}</span>
              </div>
            </div>

            {/* Section Albums */}
            <MediaSection
              title="Albums"
              items={artist.Albums}
              error={null}
              renderItem={(album) => (
                <MediaCard
                  key={album.album_id}
                  id={album.album_id}
                  title={album.title}
                  imageUrl={album.cover_url}
                  subtitle={album.release_date}
                  onClick={(id) => navigate(`/album/${id}`)}
                />
              )}
            />

            {/* Section Tracks */}
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Morceaux populaires</h2>
              <ul className="space-y-2">
                {artist.Tracks.map((track, index) => (
                  <li 
                    key={track.track_id}
                    onClick={() => navigate(`/track/${track.track_id}`)}
                    className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white transition"
                  >
                    <Music className="w-4 h-4 text-gray-400" />
                    <span>{track.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Loader */
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

/* Message si l'artiste n'est pas trouvé */
const NotFound = ({ message }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    {message}
  </div>
);

export default ArtistDetails;
