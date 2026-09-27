import { useEffect, useRef, useState } from 'react';
import { ProjectScenario } from '../types';
import {
  performAutomatedBackupCheck,
  fetchSnapshots,
  captureManualBackup,
  hasDailyBackupForToday,
  hasSessionBackup
} from '../services/backupService';
import { ScenarioSnapshotItem } from '../components/common/UniversalSnapshotManager';

export function useAutomatedBackup(scenario: ProjectScenario, totalHours?: number) {
  const [snapshots, setSnapshots] = useState<ScenarioSnapshotItem[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const lastScenarioIdRef = useRef<string>(scenario.id);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger automated backup check on scenario change or mount
  useEffect(() => {
    // Debounce slightly to allow calculations and initial loads to settle
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsBackingUp(true);
      performAutomatedBackupCheck(scenario, totalHours)
        .then((newSnapshots) => {
          if (newSnapshots.length > 0) {
            setSnapshots((prev) => [...newSnapshots, ...prev]);
          }
        })
        .catch((err) => {
          console.warn('Auto backup check notice:', err);
        })
        .finally(() => {
          setIsBackingUp(false);
        });
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scenario.id]);

  // Load existing snapshots count
  useEffect(() => {
    fetchSnapshots(scenario.id).then((items) => {
      setSnapshots(items);
    });
  }, [scenario.id]);

  const triggerManualBackup = async (label?: string) => {
    setIsBackingUp(true);
    try {
      const snap = await captureManualBackup(scenario, label, totalHours);
      setSnapshots((prev) => [snap, ...prev]);
      return snap;
    } finally {
      setIsBackingUp(false);
    }
  };

  return {
    snapshots,
    snapshotCount: snapshots.length,
    isBackingUp,
    dailyBackedUp: hasDailyBackupForToday(scenario.id),
    sessionBackedUp: hasSessionBackup(scenario.id),
    triggerManualBackup
  };
}
