import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filmService } from '../utils/api';

const FilmCard = ({ film, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: film.poster_url }}
      style={styles.poster}
      resizeMode="cover"
    />
    <View style={styles.cardContent}>
      <Text style={styles.title} numberOfLines={2}>
        {film.title}
      </Text>
      <Text style={styles.year}>
        {new Date(film.release_date).getFullYear()}
      </Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>
          {film.average_rate ? `${film.average_rate.toFixed(1)} ★` : 'Non noté'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFilms = async () => {
    try {
      const data = await filmService.getPopularFilms();
      setFilms(data);
      setError(null);
    } catch (error) {
      setError('Impossible de charger les films');
      console.error('Error fetching films:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFilms();
  }, []);

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchFilms}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={films}
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            onPress={() => navigation.navigate('FilmDetails', { id: item.resource_id })}
          />
        )}
        keyExtractor={item => item.resource_id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Films Populaires</Text>
        }
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    maxWidth: '48%',
  },
  poster: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#F6E05E',
    fontSize: 14,
  },
});

export default HomeScreen;
