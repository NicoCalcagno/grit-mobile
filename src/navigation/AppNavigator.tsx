import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, LinkingOptions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useMusicStore } from '../stores/musicStore';
import { RootStackParamList } from '../types';
import { colors } from '../constants/theme';

import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import WorkoutNavigator from './WorkoutNavigator';

import FoodLogScreen from '../screens/nutrition/FoodLogScreen';
import FoodSearchScreen from '../screens/nutrition/FoodSearchScreen';
import BarcodeScannerScreen from '../screens/nutrition/BarcodeScannerScreen';
import PhotoFoodScreen from '../screens/nutrition/PhotoFoodScreen';
import DietPlanScreen from '../screens/nutrition/DietPlanScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'grit://'],
  config: {
    screens: {
      Main: '',
    },
  },
};

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const { profile } = useUserStore();
  const { handleCallback, checkConnection } = useMusicStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('spotify-callback')) {
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string | undefined;
        if (code) {
          handleCallback(code).then(() => checkConnection());
        }
      }
    });
    return () => subscription.remove();
  }, [handleCallback, checkConnection]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const needsOnboarding = isAuthenticated && profile && !profile.onboarding_completed;

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="WorkoutSession"
              component={WorkoutNavigator}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="FoodLog" component={FoodLogScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="PhotoFood" component={PhotoFoodScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="DietPlan" component={DietPlanScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
