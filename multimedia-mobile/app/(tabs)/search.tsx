import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
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
    background: '#14181C',
    card: '#1B2228',
    border: '#2C3440',
    text: '#FFFFFF',
    textSecondary: '#99AABB',
    accent: '#00E054',
  },
  light: {
    background: '#FFFFFF',
    card: '#F4F4F4',
    border: '#E5E5E5',
    text: '#14181C',
    textSecondary: '#666666',
    accent: '#00B344',
  },
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'dark'];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const data = await filmService.searchFilms(query);
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to search films. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const renderSearchResult = ({ item }: { item: Film }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/film/${item.resource_id}`)}
    >
      <Image
        source={{ uri: item.poster_url }}
        style={styles.resultImage}
        resizeMode="cover"
      />
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.resultOverlay}>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.resultYear, { color: theme.textSecondary }]}>
            {new Date(item.release_date).getFullYear()}
          </Text>
          <View style={styles.resultMetadata}>
            <Text style={[styles.resultDirector, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.director}
            </Text>
            {item.average_rate > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={12} color={theme.accent} />
                <Text style={[styles.resultRating, { color: theme.accent }]}>
                  {item.average_rate.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
        <Icon name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search films..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setError(null);
            }}
            style={styles.clearButton}>
            <Icon name="x" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.resource_id}
          contentContainerStyle={styles.resultsList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No films found
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
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
  },
  resultsList: {
    padding: 16,
    paddingTop: 8,
  },
  resultItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultYear: {
    fontSize: 12,
    marginBottom: 4,
  },
  resultMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultDirector: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});