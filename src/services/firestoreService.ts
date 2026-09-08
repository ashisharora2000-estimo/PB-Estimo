import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ProjectScenario, PodcastEpisode } from '../types';
import { ScenarioSnapshotItem } from '../components/common/UniversalSnapshotManager';
import { isMakeAutoSyncEnabled, sendScenarioToMakeDatabase } from './makeIntegrationService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// PROJECT SCENARIOS / PROPOSALS
// ----------------------------------------------------

export interface CloudScenarioMeta {
  id: string;
  name: string;
  clientName?: string;
  industry?: string;
  description: string;
  projectWeeks: number;
  targetStartDate?: string;
  updatedAt: string;
  authorEmail?: string;
}

/**
 * Save or sync a scenario to Firestore
 */
export async function saveScenarioToCloud(scenario: ProjectScenario): Promise<void> {
  const path = `project_scenarios/${scenario.id}`;
  try {
    const docRef = doc(db, 'project_scenarios', scenario.id);
    const payload = {
      id: scenario.id,
      name: scenario.name.slice(0, 256),
      clientName: (scenario.clientName || '').slice(0, 256),
      industry: (scenario.industry || '').slice(0, 128),
      description: (scenario.description || '').slice(0, 2048),
      projectWeeks: scenario.projectWeeks || 32,
      targetStartDate: scenario.targetStartDate || '',
      scenarioDataJson: JSON.stringify(scenario),
      updatedAt: new Date().toISOString(),
      authorId: auth.currentUser?.uid || 'anonymous',
      authorEmail: auth.currentUser?.email || 'user@company.com'
    };
    await setDoc(docRef, payload, { merge: true });

    // Optional Make Database trigger (non-blocking)
    if (isMakeAutoSyncEnabled()) {
      sendScenarioToMakeDatabase(scenario).catch((err) => {
        console.warn('Make Database auto-sync notice:', err);
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch a single scenario from Firestore by ID
 */
export async function getScenarioFromCloud(id: string): Promise<ProjectScenario | null> {
  const path = `project_scenarios/${id}`;
  try {
    const docRef = doc(db, 'project_scenarios', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.scenarioDataJson) {
      return JSON.parse(data.scenarioDataJson) as ProjectScenario;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Load all project scenarios from the cloud database
 */
export async function listCloudScenarios(): Promise<ProjectScenario[]> {
  const path = 'project_scenarios';
  try {
    const colRef = collection(db, 'project_scenarios');
    const snapshot = await getDocs(colRef);
    const results: ProjectScenario[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.scenarioDataJson) {
        try {
          const parsed = JSON.parse(data.scenarioDataJson) as ProjectScenario;
          results.push(parsed);
        } catch (e) {
          console.error('Failed to parse scenario JSON', docSnap.id, e);
        }
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete a scenario from the cloud database
 */
export async function deleteScenarioFromCloud(id: string): Promise<void> {
  const path = `project_scenarios/${id}`;
  try {
    const docRef = doc(db, 'project_scenarios', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to real-time updates of all project scenarios in the cloud database
 */
export function subscribeToCloudScenarios(
  onUpdate: (scenarios: ProjectScenario[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'project_scenarios';
  const colRef = collection(db, 'project_scenarios');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const results: ProjectScenario[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.scenarioDataJson) {
          try {
            const parsed = JSON.parse(data.scenarioDataJson) as ProjectScenario;
            results.push(parsed);
          } catch (e) {
            console.error('Failed to parse scenario JSON', docSnap.id, e);
          }
        }
      });
      onUpdate(results);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------------------------------------------
// UNIVERSAL SNAPSHOTS (BASELINE AUDIT ARCHIVE)
// ----------------------------------------------------

export async function saveSnapshotToCloud(snapshot: ScenarioSnapshotItem, scenarioId: string): Promise<void> {
  const path = `universal_snapshots/${snapshot.id}`;
  try {
    const docRef = doc(db, 'universal_snapshots', snapshot.id);
    const payload = {
      id: snapshot.id,
      scenarioId,
      scenarioName: snapshot.name.slice(0, 256),
      description: (snapshot.summary || '').slice(0, 1024),
      totalEffortHours: snapshot.metrics?.totalHours || 0,
      projectWeeks: snapshot.metrics?.timelineWeeks || 32,
      avgFte: 0,
      timestamp: snapshot.timestamp,
      scenarioDataJson: JSON.stringify(snapshot.scenarioState),
      authorId: auth.currentUser?.uid || 'anonymous'
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function listCloudSnapshots(): Promise<ScenarioSnapshotItem[]> {
  const path = 'universal_snapshots';
  try {
    const colRef = collection(db, 'universal_snapshots');
    const snapshot = await getDocs(colRef);
    const results: ScenarioSnapshotItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.scenarioDataJson) {
        try {
          const scenarioState = JSON.parse(data.scenarioDataJson) as ProjectScenario;
          results.push({
            id: data.id,
            name: data.scenarioName || 'Snapshot',
            timestamp: data.timestamp,
            actionSource: 'manual_save',
            scenarioState,
            summary: data.description || '',
            metrics: {
              totalHours: data.totalEffortHours || 0,
              timelineWeeks: data.projectWeeks || 32,
              moduleCount: scenarioState.selectedModules?.length || 0
            }
          });
        } catch (e) {
          console.error('Failed to parse snapshot JSON', docSnap.id, e);
        }
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteSnapshotFromCloud(id: string): Promise<void> {
  const path = `universal_snapshots/${id}`;
  try {
    const docRef = doc(db, 'universal_snapshots', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// PODCAST EPISODES (AUDIO OVERVIEWS)
// ----------------------------------------------------

export async function savePodcastEpisodeToCloud(episode: PodcastEpisode): Promise<void> {
  const path = `podcast_episodes/${episode.id}`;
  try {
    const docRef = doc(db, 'podcast_episodes', episode.id);
    const payload = {
      id: episode.id,
      scenarioId: episode.scenarioId,
      title: episode.title.slice(0, 256),
      subtitle: (episode.subtitle || '').slice(0, 512),
      focus: episode.focus,
      accent: episode.accent || 'en-US',
      summary: (episode.summary || '').slice(0, 4096),
      dialogueJson: JSON.stringify(episode.dialogue),
      createdAt: episode.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getPodcastEpisodeFromCloud(episodeId: string): Promise<PodcastEpisode | null> {
  const path = `podcast_episodes/${episodeId}`;
  try {
    const docRef = doc(db, 'podcast_episodes', episodeId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      id: d.id,
      scenarioId: d.scenarioId,
      clientName: d.clientName || 'Enterprise Program',
      title: d.title,
      subtitle: d.subtitle || '',
      focus: d.focus || 'deep_dive',
      accent: d.accent || 'en-IN',
      summary: d.summary || '',
      keyTakeaways: d.keyTakeaways ? JSON.parse(d.keyTakeaways) : [],
      durationMinutes: 6,
      estimatedSeconds: 360,
      hosts: {
        host1: { name: 'Alex', title: 'Oracle Enterprise Architect', avatarColor: 'from-amber-600 to-orange-700', voiceType: 'female' },
        host2: { name: 'Jordan', title: 'VP of Delivery & Sizing', avatarColor: 'from-blue-600 to-indigo-700', voiceType: 'male' }
      },
      dialogue: JSON.parse(d.dialogueJson),
      createdAt: d.createdAt
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function listPodcastEpisodesFromCloud(): Promise<PodcastEpisode[]> {
  const path = 'podcast_episodes';
  try {
    const colRef = collection(db, 'podcast_episodes');
    const snapshot = await getDocs(colRef);
    const results: PodcastEpisode[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.dialogueJson) {
        try {
          results.push({
            id: d.id,
            scenarioId: d.scenarioId,
            clientName: d.clientName || 'Enterprise Program',
            title: d.title,
            subtitle: d.subtitle || '',
            focus: d.focus || 'deep_dive',
            accent: d.accent || 'en-IN',
            summary: d.summary || '',
            keyTakeaways: d.keyTakeaways ? JSON.parse(d.keyTakeaways) : [],
            durationMinutes: 6,
            estimatedSeconds: 360,
            hosts: {
              host1: { name: 'Alex', title: 'Oracle Enterprise Architect', avatarColor: 'from-amber-600 to-orange-700', voiceType: 'female' },
              host2: { name: 'Jordan', title: 'VP of Delivery & Sizing', avatarColor: 'from-blue-600 to-indigo-700', voiceType: 'male' }
            },
            dialogue: JSON.parse(d.dialogueJson),
            createdAt: d.createdAt
          });
        } catch (e) {
          console.error('Failed to parse podcast episode JSON', docSnap.id, e);
        }
      }
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
