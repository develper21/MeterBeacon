import { storage } from "@/shared/services/storage.service";
import type { Tracker, TrackerHistory } from "@/shared/types";

export const trackerService = {
  getTrackers: (): Tracker[] => storage.getTrackers(),
  
  setTrackers: (trackers: Tracker[]) => storage.setTrackers(trackers),
  
  addTracker: (tracker: Tracker) => storage.addTracker(tracker),
  
  updateTracker: (id: string, updates: Partial<Tracker>) => storage.updateTracker(id, updates),
  
  deleteTracker: (id: string) => storage.deleteTracker(id),
  
  getTrackerHistory: (trackerId?: string): TrackerHistory[] => 
    storage.getTrackerHistory(trackerId),
  
  addTrackerHistory: (history: TrackerHistory) => storage.addTrackerHistory(history),
};
