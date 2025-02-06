import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import FilmDetailsScreen from './src/screens/FilmDetailsScreen';
import SearchScreen from './src/screens/SearchScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const FilmsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#1A202C',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="FilmsList" 
      component={HomeScreen}
      options={{ 
        title: 'Multimedia',
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="FilmDetails" 
      component={FilmDetailsScreen}
      options={{ 
        headerTransparent: true,
        headerTitle: '',
        headerBackVisible: true,
      }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case 'Home':
                  iconName = 'home';
                  break;
                case 'Search':
                  iconName = 'search';
                  break;
                case 'Profile':
                  iconName = 'user';
                  break;
                default:
                  iconName = 'circle';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4299E1',
            tabBarInactiveTintColor: '#A0AEC0',
            tabBarStyle: {
              backgroundColor: '#1A202C',
              borderTopColor: '#2D3748',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#1A202C',
            },
            headerTintColor: '#fff',
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={FilmsStack}
            options={{
              title: 'Accueil',
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Search" 
            component={SearchScreen}
            options={{
              title: 'Rechercher',
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              title: 'Profil',
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
