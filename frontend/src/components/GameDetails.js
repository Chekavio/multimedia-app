import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, StarHalf, Star as StarOutline, Loader2, ArrowLeft, User2 } from 'lucide-react';
import { gameService } from '../utils/api';

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setIsLoading(true);
        const data = await gameService.getGameDetails(id);
        setGame(data);
      } catch (error) {
        setError("Impossible de charger les détails du jeu");
        console.error("Error fetching game details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  if (isLoading) return <Loader2 className="animate-spin text-blue-500 w-8 h-8 mx-auto mt-10" />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!game) return <div className="text-gray-400 text-center mt-10">Jeu non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Retour
        </button>

        <h1 className="text-4xl font-bold mb-4">{game.title}</h1>
        <p className="text-gray-300">{game.description}</p>

        {/* Avis des utilisateurs */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Avis des utilisateurs</h2>
          {game.GameReviews && game.GameReviews.length > 0 ? (
            game.GameReviews.map((review, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg mb-2">
                <p className="text-gray-300">{review.review_text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Aucun avis pour ce jeu.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
