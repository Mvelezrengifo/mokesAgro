import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthService } from '../services/auth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import CreateReportScreen from '../screens/CreateReportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLogin={() => {}} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportsList" component={ReportsListScreen} />
    <Stack.Screen name="CreateReport" component={CreateReportScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2E7D32',
      tabBarInactiveTintColor: '#757575',
    }}
  >
    <Tab.Screen 
      name="Reports" 
      component={ReportsStack}
      options={{
        tabBarLabel: 'Informes',
        tabBarIcon: () => null, // Aquí irían los iconos
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return null; // Loading screen
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;