import { ProjectScenario } from '../types';
import { ScenarioSnapshotItem } from '../components/common/UniversalSnapshotManager';
import {
  saveSnapshotToCloud,
  listCloudSnapshotsForScenario,
  deleteSnapshotFromCloud,
  subscribeToCloudSnapshots
} from './firestoreService';

const SESSION_STORAGE_KEY_PREFIX = 'fusion_backup_session_';
const DAILY_STORAGE_KEY_PREFIX = 'fusion_backup_daily_';
const LOCAL_SNAPSHOTS_PREFIX = 'fusion_snapshots_';

/**
 * Get or initialize a unique browser session ID
 */
export function getSessionId(): string {
  try {
    let sessId = sessionStorage.getItem('fusion_browser_session_id');
    if (!sessId) {
      sessId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem('fusion_browser_session_id', sessId);
    }
    return sessId;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/**
 * Get current date string formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Format a snapshot ID into an allowed ID string matching ^[a-zA-Z0-9_\-\.:]+$ and <= 128 chars
 */
function sanitizeDocId(prefix: string, scenarioId: string, suffix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_\\-]/g, '_');
  const cleanScenarioId = scenarioId.replace(/[^a-zA-Z0-9_\\-]/g, '_').slice(0, 32);
  const cleanSuffix = suffix.replace(/[^a-zA-Z0-9_\\-]/g, '_');
  const id = `${cleanPrefix}_${cleanScenarioId}_${cleanSuffix}`;
  return id.slice(0, 120);
}

/**
 * Check if automated daily backup has already been completed today for this scenario
 */
export function hasDailyBackupForToday(scenarioId: string): boolean {
  const today = getTodayDateString();
  try {
    return localStorage.getItem(`${DAILY_STORAGE_KEY_PREFIX}${scenarioId}_${today}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if automated session backup has already been completed for current session
 */
export function hasSessionBackup(scenarioId: string): boolean {
  const sessionId = getSessionId();
  try {
    return sessionStorage.getItem(`${SESSION_STORAGE_KEY_PREFIX}${scenarioId}_${sessionId}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark daily backup as completed
 */
function markDailyBackupCompleted(scenarioId: string): void {
  const today = getTodayDateString();
  try {
    localStorage.setItem(`${DAILY_STORAGE_KEY_PREFIX}${scenarioId}_${today}`, 'true');
  } catch {
    // ignore
  }
}

/**
 * Mark session backup as completed
 */
function markSessionBackupCompleted(scenarioId: string): void {
  const sessionId = getSessionId();
  try {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY_PREFIX}${scenarioId}_${sessionId}`, 'true');
  } catch {
    // ignore
  }
}

/**
 * Create a snapshot object from scenario
 */
export function createSnapshotFromScenario(
  scenario: ProjectScenario,
  actionSource: ScenarioSnapshotItem['actionSource'],
  name: string,
  totalHours: number = 0
): ScenarioSnapshotItem {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  const now = Date.now();
  let id: string;
  if (actionSource === 'automated_daily') {
    id = sanitizeDocId('snap_daily', scenario.id, getTodayDateString());
  } else if (actionSource === 'automated_session') {
    id = sanitizeDocId('snap_sess', scenario.id, `${now}`);
  } else {
    id = sanitizeDocId('snap_manual', scenario.id, `${now}`);
  }

  const moduleCount = scenario.selectedModules?.length || 0;
  const legalEntities = scenario.scaleDrivers?.fin_ent || 1;
  const weeks = scenario.projectWeeks || 32;

  let summary = `${moduleCount} Modules • ${legalEntities} Legal Entities • ${weeks}w Timeline`;
  if (actionSource === 'automated_daily') {
    summary = `[src:automated_daily] Daily Cloud Backup • ${moduleCount} Modules • ${weeks}w Timeline`;
  } else if (actionSource === 'automated_session') {
    summary = `[src:automated_session] Session Snapshot • ${moduleCount} Modules • ${weeks}w Timeline`;
  }

  return {
    id,
    name,
    timestamp,
    actionSource,
    scenarioState: JSON.parse(JSON.stringify(scenario)),
    summary,
    metrics: {
      totalHours,
      timelineWeeks: weeks,
      moduleCount
    }
  };
}

/**
 * Save snapshot to both local storage and Firestore
 */
export async function persistSnapshot(
  snapshot: ScenarioSnapshotItem,
  scenarioId: string
): Promise<void> {
  // 1. Save to local storage for instant responsiveness
  try {
    const key = `${LOCAL_SNAPSHOTS_PREFIX}${scenarioId}`;
    const stored = localStorage.getItem(key);
    const existing: ScenarioSnapshotItem[] = stored ? JSON.parse(stored) : [];
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)].slice(0, 30);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save snapshot to local storage', err);
  }

  // 2. Persist to Cloud Firestore
  await saveSnapshotToCloud(snapshot, scenarioId);
}

/**
 * Perform automated backup check and save if needed
 * Returns any newly created snapshots
 */
export async function performAutomatedBackupCheck(
  scenario: ProjectScenario,
  totalHours: number = 0
): Promise<ScenarioSnapshotItem[]> {
  const created: ScenarioSnapshotItem[] = [];

  // Check 1: Daily backup
  if (!hasDailyBackupForToday(scenario.id)) {
    const todayFormatted = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const dailySnapshot = createSnapshotFromScenario(
      scenario,
      'automated_daily',
      `Daily Backup (${todayFormatted})`,
      totalHours
    );

    try {
      await persistSnapshot(dailySnapshot, scenario.id);
      markDailyBackupCompleted(scenario.id);
      created.push(dailySnapshot);
    } catch (e) {
      console.warn('Automated daily backup notice:', e);
    }
  }

  // Check 2: Session backup
  if (!hasSessionBackup(scenario.id)) {
    const timeFormatted = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const sessionSnapshot = createSnapshotFromScenario(
      scenario,
      'automated_session',
      `Session Checkpoint (${timeFormatted})`,
      totalHours
    );

    try {
      await persistSnapshot(sessionSnapshot, scenario.id);
      markSessionBackupCompleted(scenario.id);
      created.push(sessionSnapshot);
    } catch (e) {
      console.warn('Automated session backup notice:', e);
    }
  }

  return created;
}

/**
 * Trigger an instant on-demand backup
 */
export async function captureManualBackup(
  scenario: ProjectScenario,
  name?: string,
  totalHours: number = 0
): Promise<ScenarioSnapshotItem> {
  const timeFormatted = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const snapshotName = name?.trim() || `Manual Snapshot (${timeFormatted})`;
  const snapshot = createSnapshotFromScenario(
    scenario,
    'manual_save',
    snapshotName,
    totalHours
  );

  await persistSnapshot(snapshot, scenario.id);
  return snapshot;
}

/**
 * Fetch all snapshots for a scenario (merging Cloud Firestore + Local Storage)
 */
export async function fetchSnapshots(scenarioId: string): Promise<ScenarioSnapshotItem[]> {
  const map = new Map<string, ScenarioSnapshotItem>();

  // 1. Read from local storage
  try {
    const key = `${LOCAL_SNAPSHOTS_PREFIX}${scenarioId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const localItems: ScenarioSnapshotItem[] = JSON.parse(stored);
      localItems.forEach((item) => map.set(item.id, item));
    }
  } catch (err) {
    console.warn('Failed to read local snapshots', err);
  }

  // 2. Read from Cloud Firestore
  try {
    const cloudItems = await listCloudSnapshotsForScenario(scenarioId);
    if (cloudItems && cloudItems.length > 0) {
      cloudItems.forEach((item) => map.set(item.id, item));
    }
  } catch (err) {
    console.warn('Failed to fetch cloud snapshots for scenario', err);
  }

  const merged = Array.from(map.values());
  // Sort descending by ID or timestamp
  merged.sort((a, b) => b.id.localeCompare(a.id));
  return merged;
}

/**
 * Delete a snapshot from both local storage and Cloud Firestore
 */
export async function deleteSnapshot(id: string, scenarioId: string): Promise<void> {
  // 1. Remove from local storage
  try {
    const key = `${LOCAL_SNAPSHOTS_PREFIX}${scenarioId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const localItems: ScenarioSnapshotItem[] = JSON.parse(stored);
      const filtered = localItems.filter((s) => s.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('Failed to delete snapshot from local storage', err);
  }

  // 2. Remove from Cloud Firestore
  await deleteSnapshotFromCloud(id);
}

/**
 * Calculate high-level diff between active scenario and snapshot state
 */
export function calculateScenarioDiff(current: ProjectScenario, snapshot: ProjectScenario): {
  moduleDiff: number;
  weeksDiff: number;
  entitiesDiff: number;
  hasChanges: boolean;
} {
  const currentModules = current.selectedModules?.length || 0;
  const snapshotModules = snapshot.selectedModules?.length || 0;
  const moduleDiff = snapshotModules - currentModules;

  const currentWeeks = current.projectWeeks || 32;
  const snapshotWeeks = snapshot.projectWeeks || 32;
  const weeksDiff = snapshotWeeks - currentWeeks;

  const currentEntities = current.scaleDrivers?.fin_ent || 1;
  const snapshotEntities = snapshot.scaleDrivers?.fin_ent || 1;
  const entitiesDiff = snapshotEntities - currentEntities;

  const hasChanges = moduleDiff !== 0 || weeksDiff !== 0 || entitiesDiff !== 0;

  return {
    moduleDiff,
    weeksDiff,
    entitiesDiff,
    hasChanges
  };
}
