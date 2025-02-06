import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Icon from '@expo/vector-icons/Feather';
import { filmService } from '../../src/utils/api';

const { width: screenWidth } = Dimensions.get('window');

export default function FilmDetails() {
  const { id } = useLocalSearchParams();
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
      stars.push(
        <Icon
          key={i}
          name="star"
          size={16}
          color={i <= Math.floor(rating) ? '#F6E05E' : '#4A5568'}
        />
      );
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
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film non trouvé</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: film.poster_url }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{film.title}</Text>
          
          <View style={styles.metaInfo}>
            {film.release_date && (
              <Text style={styles.metaText}>
                {new Date(film.release_date).getFullYear()}
              </Text>
            )}
            {film.duration && (
              <View style={styles.metaItem}>
                <Icon name="clock" size={16} color="#A0AEC0" />
                <Text style={styles.metaText}>{film.duration} min</Text>
              </View>
            )}
            <View style={styles.ratingContainer}>
              {renderStars(film.average_rate || 0)}
              <Text style={styles.rating}>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis</Text>
            {film.reviews && film.reviews.length > 0 ? (
              film.reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{
                        uri: review.profile_picture || 'https://via.placeholder.com/40',
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

      <TouchableOpacity style={styles.addReviewButton}>
        <Icon name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addReviewText}>Ajouter un avis</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    color: '#FC8181',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4299E1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerContainer: {
    height: 300,
    width: screenWidth,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#A0AEC0',
    marginLeft: 8,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    color: '#E2E8F0',
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
    color: '#E2E8F0',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewText: {
    color: '#E2E8F0',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  noReviews: {
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  addReviewButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#4299E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 4,
  },
  addReviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
