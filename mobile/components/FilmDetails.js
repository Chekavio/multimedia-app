import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { filmService } from '../utils/api';

const FilmDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
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
        stars.push(<Icon key={i} name="star" size={20} color="#FFD700" />);
      } else if (i - rating < 1) {
        stars.push(<Icon key={i} name="star" size={20} color="#FFD700" style={styles.halfStar} />);
      } else {
        stars.push(<Icon key={i} name="star" size={20} color="#808080" />);
      }
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film non trouvé</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#808080" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Poster */}
          <Image
            source={{ uri: film.poster_url }}
            style={styles.poster}
            resizeMode="cover"
          />

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{film.title}</Text>
            
            <View style={styles.metaInfo}>
              {film.duration && (
                <View style={styles.metaItem}>
                  <Icon name="clock" size={16} color="#808080" />
                  <Text style={styles.metaText}>{film.duration} min</Text>
                </View>
              )}
              {film.director && (
                <View style={styles.metaItem}>
                  <Icon name="user" size={16} color="#808080" />
                  <Text style={styles.metaText}>{film.director}</Text>
                </View>
              )}
              <View style={styles.ratingContainer}>
                {renderStars(film.average_rate || 0)}
                <Text style={styles.ratingText}>
                  {film.average_rate ? film.average_rate.toFixed(1) : 'Non noté'}
                </Text>
              </View>
            </View>

            {film.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Synopsis</Text>
                <Text style={styles.description}>{film.description}</Text>
              </View>
            )}

            {film.genres && film.genres.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genres</Text>
                <View style={styles.genresContainer}>
                  {film.genres.map((genre, index) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Avis des utilisateurs</Text>
            {film.reviews && film.reviews.length > 0 ? (
              film.reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ 
                        uri: review.profile_picture || 'https://via.placeholder.com/50'
                      }}
                      style={styles.profilePicture}
                    />
                    <View style={styles.reviewInfo}>
                      <Text style={styles.username}>{review.username}</Text>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.review_text}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>Aucun avis pour ce film.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#808080',
    marginLeft: 8,
    fontSize: 16,
  },
  poster: {
    width: '100%',
    height: 450,
    borderRadius: 8,
  },
  infoContainer: {
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#808080',
    marginLeft: 8,
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfStar: {
    opacity: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#808080',
    marginLeft: 4,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    color: '#D1D5DB',
    lineHeight: 24,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#2D3748',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  genreText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewCard: {
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  username: {
    color: '#E5E7EB',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewText: {
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  noReviews: {
    color: '#808080',
    fontStyle: 'italic',
  },
});

export default FilmDetails;
