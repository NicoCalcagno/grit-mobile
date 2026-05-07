import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutStackParamList } from '../types';
import WorkoutSetupScreen from '../screens/workout/WorkoutSetupScreen';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import RestTimerScreen from '../screens/workout/RestTimerScreen';
import PostWorkoutScreen from '../screens/workout/PostWorkoutScreen';

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export default function WorkoutNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="WorkoutSetup" component={WorkoutSetupScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <Stack.Screen name="RestTimer" component={RestTimerScreen} />
      <Stack.Screen name="PostWorkout" component={PostWorkoutScreen} />
    </Stack.Navigator>
  );
}
