import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MediaSection, MediaCard } from './media';
import { filmService, bookService, gameService, musicService } from '../utils/api';

const Home = () => {
  const [mediaData, setMediaData] = useState({
    films: [],
    books: [],
    games: [],
    artists: [],
    albums: [],
    tracks: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllMedia = async () => {
      console.log("🟢 Début de la récupération des médias...");

      try {
        setIsLoading(true);
        const [
          popularFilms,
          popularBooks,
          popularGames,
          popularArtists,
          popularAlbums,
          popularTracks
        ] = await Promise.allSettled([
          filmService.getPopularFilms(),
          bookService.getPopularBooks(),
          gameService.getPopularGames(),
          musicService.getPopularArtists(),
          musicService.getPopularAlbums(),
          musicService.getPopularTracks()
        ]);

        console.log("🎬 Films:", popularFilms);
        console.log("📚 Livres:", popularBooks);
        console.log("🎮 Jeux:", popularGames);
        console.log("🎤 Artistes:", popularArtists);
        console.log("💿 Albums:", popularAlbums);
        console.log("🎼 Tracks:", popularTracks);

        setMediaData({
          films: popularFilms.status === 'fulfilled' ? popularFilms.value : [],
          books: popularBooks.status === 'fulfilled' ? popularBooks.value : [],
          games: popularGames.status === 'fulfilled' ? popularGames.value : [],
          artists: popularArtists.status === 'fulfilled' ? popularArtists.value : [],
          albums: popularAlbums.status === 'fulfilled' ? popularAlbums.value : [],
          tracks: popularTracks.status === 'fulfilled' ? popularTracks.value : []
        });

        const newErrors = {};
        if (popularFilms.status === 'rejected') newErrors.films = 'Erreur lors du chargement des films';
        if (popularBooks.status === 'rejected') newErrors.books = 'Erreur lors du chargement des livres';
        if (popularGames.status === 'rejected') newErrors.games = 'Erreur lors du chargement des jeux';
        if (popularArtists.status === 'rejected') newErrors.artists = 'Erreur lors du chargement des artistes';
        if (popularAlbums.status === 'rejected') newErrors.albums = 'Erreur lors du chargement des albums';
        if (popularTracks.status === 'rejected') newErrors.tracks = 'Erreur lors du chargement des pistes';

        console.log("🚨 Erreurs détectées :", newErrors);
        setErrors(newErrors);
      } catch (err) {
        console.error("❌ Erreur inattendue :", err);
        setErrors({ global: 'Une erreur inattendue est survenue.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMedia();
  }, []);

  const renderFilm = (film) => (
    <MediaCard
      key={film.film_id}
      id={film.film_id}
      title={film.title}
      imageUrl={film.poster_url}
      subtitle={new Date(film.release_date).getFullYear()}
      onClick={(id) => navigate(`/film/${id}`)}
    />
  );

  const renderBook = (book) => (
    <MediaCard
      key={book.book_id}
      id={book.book_id}
      title={book.title}
      imageUrl={book.cover_url}
      subtitle={book.authors?.join(', ')}
      onClick={(id) => navigate(`/book/${id}`)}
    />
  );

  const renderGame = (game) => (
    <MediaCard
      key={game.game_id}
      id={game.game_id}
      title={game.title}
      imageUrl={game.cover_url}
      subtitle={game.publisher}
      onClick={(id) => navigate(`/game/${id}`)}
    />
  );

  const renderArtist = (artist) => (
    <MediaCard
      key={artist.artist_id}
      id={artist.artist_id}
      title={artist.name}
      imageUrl={artist.image_url}
      subtitle={artist.genre}
      onClick={(id) => navigate(`/artist/${id}`)}
    />
  );

  const renderAlbum = (album) => (
    <MediaCard
      key={album.album_id}
      id={album.album_id}
      title={album.title}
      imageUrl={album.cover_url}
      subtitle={album.artist_name}
      onClick={(id) => navigate(`/album/${id}`)}
    />
  );

  const renderTrack = (track) => (
    <MediaCard
      key={track.track_id}
      id={track.track_id}
      title={track.title}
      imageUrl={track.cover_url}
      subtitle={track.artist_name}
      onClick={(id) => navigate(`/track/${id}`)}
    />
  );

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
        {errors.global && <div className="text-red-500 text-center">{errors.global}</div>}

        <MediaSection
          title="Films populaires"
          items={mediaData.films}
          error={errors.films}
          renderItem={renderFilm}
        />
        <MediaSection
          title="Livres populaires"
          items={mediaData.books}
          error={errors.books}
          renderItem={renderBook}
        />
        <MediaSection
          title="Jeux populaires"
          items={mediaData.games}
          error={errors.games}
          renderItem={renderGame}
        />
        <MediaSection
          title="Artistes populaires"
          items={mediaData.artists}
          error={errors.artists}
          renderItem={renderArtist}
        />
        <MediaSection
          title="Albums populaires"
          items={mediaData.albums}
          error={errors.albums}
          renderItem={renderAlbum}
        />
        <MediaSection
          title="Musiques populaires"
          items={mediaData.tracks}
          error={errors.tracks}
          renderItem={renderTrack}
        />
      </div>
    </div>
  );
};

export default Home;
