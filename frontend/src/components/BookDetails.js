import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, StarHalf, Star as StarOutline, Loader2, ArrowLeft, User2 } from 'lucide-react';
import { bookService } from '../utils/api';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);
        const data = await bookService.getBookDetails(id);
        setBook(data);
      } catch (error) {
        setError("Impossible de charger les détails du livre");
        console.error("Error fetching book details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
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
      <div className="text-center text-red-500 mt-10">
        {error}
        <button onClick={() => navigate(-1)} className="block mt-4 text-blue-500">
          Retour
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Livre non trouvé
        <button onClick={() => navigate(-1)} className="block mt-4 text-blue-500">
          Retour
        </button>
      </div>
    );
  }

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
          <div className="md:col-span-1">
            <img
              src={book.cover_url || '/api/placeholder/300/450'}
              alt={book.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{book.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
              {book.authors && (
                <div className="flex items-center">
                  <User2 className="w-4 h-4 mr-2" />
                  {book.authors.join(', ')}
                </div>
              )}
              {book.published_date && (
                <div>
                  <span className="mr-2">Publié en :</span> {new Date(book.published_date).getFullYear()}
                </div>
              )}
              <div className="flex items-center gap-1">
                {book.average_rate ? renderStars(book.average_rate) : <StarOutline className="text-gray-400 w-5 h-5" />}
                <span>{book.average_rate || 'Non noté'}</span>
              </div>
            </div>

            {book.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-300">{book.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Avis des utilisateurs */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Avis des utilisateurs</h2>
          {book.BookReviews && book.BookReviews.length > 0 ? (
            <div className="space-y-4">
              {book.BookReviews.map((review, index) => (
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
            <p className="text-gray-400">Aucun avis pour ce livre.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
