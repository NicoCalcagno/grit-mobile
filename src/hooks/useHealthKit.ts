import { useState, useEffect, useRef } from 'react';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

interface HealthKitData {
  heartRate: number;
  calories: number;
  isAuthorized: boolean;
  requestPermissions: () => Promise<void>;
}

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.Height,
    ],
    write: [AppleHealthKit.Constants.Permissions.Workouts],
  },
};

export function useHealthKit(polling = false): HealthKitData {
  const [heartRate, setHeartRate] = useState(0);
  const [calories, setCalories] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = () => {
    const now = new Date().toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    AppleHealthKit.getHeartRateSamples(
      { startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), endDate: now, limit: 1, ascending: false },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) setHeartRate(Math.round(results[0].value));
      },
    );

    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startOfDay.toISOString(), endDate: now },
      (_err: unknown, results: HealthValue[]) => {
        if (results?.length > 0) {
          const total = results.reduce((sum, r) => sum + r.value, 0);
          setCalories(Math.round(total));
        }
      },
    );
  };

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

  return { heartRate, calories, isAuthorized, requestPermissions };
}
