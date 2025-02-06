import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Feather';
import { filmService } from '../../src/utils/api';

interface Film {
  resource_id: string;
  poster_url: string;
  title: string;
  release_date: string;
  average_rate: number;
  director: string;
  genres: string[];
  description: string;
  duration: number;
}

const THEME = {
  dark: {
    background: '#1a1a1a',
    surface: '#262626',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    accent: '#E50914',
    border: '#404040',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#E50914',
    border: '#E5E7EB',
  },
};

export default function HomeScreen() {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'dark'];

  const fetchFilms = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await filmService.getPopularFilms();
      setFilms(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Unable to load films. Please try again.');
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const renderFilmItem = ({ item }: { item: Film }) => (
    <TouchableOpacity
      style={styles.filmItem}
      onPress={() => router.push(`/film/${item.resource_id}`)}
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: item.poster_url }}
          style={styles.filmPoster}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.gradientOverlay}
        />
        <View style={styles.filmInfo}>
          <Text style={[styles.filmTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.filmMetadata}>
            <View style={styles.metadataLeft}>
              <Text style={[styles.filmYear, { color: theme.textSecondary }]}>
                {new Date(item.release_date).getFullYear()}
              </Text>
              {item.duration && (
                <Text style={[styles.duration, { color: theme.textSecondary }]}>
                  • {Math.floor(item.duration / 60)}h {item.duration % 60}m
                </Text>
              )}
            </View>
            {item.average_rate > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={[styles.filmRating, { color: theme.text }]}>
                  {item.average_rate.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {item.genres.slice(0, 2).map((genre, index) => (
                <View 
                  key={genre} 
                  style={[
                    styles.genreTag, 
                    { backgroundColor: theme.surface, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.genreText, { color: theme.textSecondary }]}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={() => fetchFilms()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Popular Movies
      </Text>
      <FlatList
        data={films}
        renderItem={renderFilmItem}
        keyExtractor={(item) => item.resource_id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filmList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchFilms(true)}
            tintColor={theme.accent}
          />
        }
      />
    </View>
  );
}

const { width } = Dimensions.get('window');
const POSTER_WIDTH = width * 0.65;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  filmList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  filmItem: {
    width: POSTER_WIDTH,
    marginHorizontal: 4,
  },
  posterContainer: {
    width: '100%',
    height: POSTER_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  filmPoster: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  filmInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  filmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  filmMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filmYear: {
    fontSize: 15,
    fontWeight: '500',
  },
  duration: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filmRating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
