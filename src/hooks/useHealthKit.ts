import { useState, useEffect, useRef, useCallback } from 'react';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

export interface HealthKitData {
  heartRate: number;
  restingHeartRate: number;
  hrv: number;
  calories: number;
  steps: number;
  distanceKm: number;
  vo2Max: number;
  weightKg: number;
  bodyFatPct: number;
  isAuthorized: boolean;
  requestPermissions: () => Promise<void>;
  refresh: () => void;
}

const PERMISSIONS = {
  permissions: {
    read: [
      'HeartRate',
      'ActiveEnergyBurned',
      'BodyMass',
      'Height',
      'Steps',
      'DistanceWalkingRunning',
      'Vo2Max',
      'HeartRateVariabilitySDNN',
      'BodyFatPercentage',
      'RestingHeartRate',
    ],
    write: ['Workouts'],
  },
} as unknown as HealthKitPermissions;

export function useHealthKit(polling = false): HealthKitData {
  const [heartRate, setHeartRate] = useState(0);
  const [restingHeartRate, setRestingHeartRate] = useState(0);
  const [hrv, setHrv] = useState(0);
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [vo2Max, setVo2Max] = useState(0);
  const [weightKg, setWeightKg] = useState(0);
  const [bodyFatPct, setBodyFatPct] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(() => {
    const now = new Date().toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    AppleHealthKit.getHeartRateSamples(
      { startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), endDate: now, limit: 1, ascending: false },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) setHeartRate(Math.round(results[0].value));
      },
    );

    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startOfDayISO, endDate: now },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) {
          const total = results.reduce((sum, r) => sum + r.value, 0);
          setCalories(Math.round(total));
        }
      },
    );

    AppleHealthKit.getStepCount(
      { startDate: startOfDayISO, endDate: now },
      (_err: unknown, result: HealthValue) => {
        if (result?.value != null) setSteps(Math.round(result.value));
      },
    );

    AppleHealthKit.getDistanceWalkingRunning(
      { startDate: startOfDayISO, endDate: now, unit: 'meter' as any },
      (_err: unknown, result: HealthValue) => {
        if (result?.value != null) setDistanceKm(Math.round((result.value / 1000) * 10) / 10);
      },
    );

    (AppleHealthKit as any).getMostRecentWeight?.(
      { unit: 'kilogram' },
      (_err: unknown, result: HealthValue) => {
        if (result?.value != null) setWeightKg(Math.round(result.value * 10) / 10);
      },
    );

    (AppleHealthKit as any).getMostRecentBodyFatPercentage?.(
      {},
      (_err: unknown, result: HealthValue) => {
        if (result?.value != null) setBodyFatPct(Math.round(result.value * 10) / 10);
      },
    );

    (AppleHealthKit as any).getHeartRateVariabilitySamples?.(
      { startDate: weekAgo, endDate: now, limit: 1, ascending: false },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) setHrv(Math.round(results[0].value));
      },
    );

    (AppleHealthKit as any).getRestingHeartRateSamples?.(
      { startDate: weekAgo, endDate: now, limit: 1, ascending: false },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) setRestingHeartRate(Math.round(results[0].value));
      },
    );

    (AppleHealthKit as any).getVo2MaxSamples?.(
      { startDate: weekAgo, endDate: now, limit: 1, ascending: false },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) setVo2Max(Math.round(results[0].value * 10) / 10);
      },
    );
  }, []);

  const requestPermissions = (): Promise<void> =>
    new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (err: string) => {
        if (err) {
          reject(new Error(err));
          return;
        }
        setIsAuthorized(true);
        fetchData();
        resolve();
      });
    });

  useEffect(() => {
    AppleHealthKit.isAvailable((err: unknown, available: boolean) => {
      if (!err && available) {
        AppleHealthKit.initHealthKit(PERMISSIONS, (initErr: string) => {
          if (!initErr) {
            setIsAuthorized(true);
            fetchData();
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (polling && isAuthorized) {
      intervalRef.current = setInterval(fetchData, 5000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [polling, isAuthorized]);

  return {
    heartRate, restingHeartRate, hrv,
    calories, steps, distanceKm,
    vo2Max, weightKg, bodyFatPct,
    isAuthorized,
    requestPermissions,
    refresh: fetchData,
  };
}
