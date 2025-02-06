import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from './screens/HomeScreen';
import FilmDetailsScreen from './screens/FilmDetailsScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
    }}
  >
    <Stack.Screen 
      name="FilmsList" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="FilmDetails" 
      component={FilmDetailsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
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
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#1A202C',
            borderTopColor: '#2D3748',
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
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{ title: 'Rechercher' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profil' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
