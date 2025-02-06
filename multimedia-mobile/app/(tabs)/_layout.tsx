import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Icon from '@expo/vector-icons/Feather';

const THEME = {
  dark: {
    background: '#14181C',
    card: '#1B2228',
    border: '#2C3440',
    text: '#FFFFFF',
    textSecondary: '#99AABB',
    accent: '#00E054',
    tabBar: '#1B2228',
  },
  light: {
    background: '#FFFFFF',
    card: '#F4F4F4',
    border: '#E5E5E5',
    text: '#14181C',
    textSecondary: '#666666',
    accent: '#00B344',
    tabBar: '#FFFFFF',
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Films',
          tabBarIcon: ({ color, size }) => <Icon name="film" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
