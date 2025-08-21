import { create } from 'zustand';
import { PainPoint } from '@/types/pain';

interface PainStore {
  painPoints: PainPoint[];
  addPainPoint: (painPoint: PainPoint) => void;
  updatePainPoint: (painPoint: PainPoint) => void;
  removePainPoint: (id: string) => void;
  clearAllPainPoints: () => void;
  getPainPoint: (id: string) => PainPoint | undefined;
}

export const usePainStore = create<PainStore>((set, get) => ({
  painPoints: [],
  
  addPainPoint: (painPoint: PainPoint) => {
    set((state) => ({
      painPoints: [...state.painPoints, painPoint],
    }));
  },
  
  updatePainPoint: (painPoint: PainPoint) => {
    set((state) => ({
      painPoints: state.painPoints.map((point) =>
        point.id === painPoint.id
          ? { ...painPoint, updatedAt: new Date().toISOString() }
          : point
      ),
    }));
  },
  
  removePainPoint: (id: string) => {
    set((state) => ({
      painPoints: state.painPoints.filter((point) => point.id !== id),
    }));
  },
  
  clearAllPainPoints: () => {
    set({ painPoints: [] });
  },
  
  getPainPoint: (id: string) => {
    return get().painPoints.find((point) => point.id === id);
  },
}));
