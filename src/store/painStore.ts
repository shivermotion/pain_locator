import { create } from 'zustand';
import { PainPoint } from '@/types/pain';

interface PainStore {
  painPoints: PainPoint[];
  addPainPoint: (painPoint: PainPoint) => void;
  updatePainPoint: (painPoint: PainPoint) => void;
  removePainPoint: (id: string) => void;
  clearAllPainPoints: () => void;
  getPainPoint: (id: string) => PainPoint | undefined;
  appendRadiatingPoint: (id: string, point: [number, number, number]) => void; // deprecated
  appendPointToStroke: (id: string, point: [number, number, number]) => void;
  beginStroke: (id: string) => void;
  endStroke: (id: string) => void;
  undoLastStroke: (id: string) => void;
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

  appendRadiatingPoint: (id: string, point: [number, number, number]) => {
    set((state) => ({
      painPoints: state.painPoints.map((p) => {
        if (p.id !== id) return p;
        const currentStrokes = p.strokes || [];
        if (currentStrokes.length === 0) {
          // auto-begin if not started
          currentStrokes.push([point]);
        } else {
          currentStrokes[currentStrokes.length - 1] = currentStrokes[currentStrokes.length - 1].concat([
            point,
          ]);
        }
        return { ...p, strokes: currentStrokes, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  appendPointToStroke: (id: string, point: [number, number, number]) => {
    set((state) => ({
      painPoints: state.painPoints.map((p) => {
        if (p.id !== id) return p;
        const strokes = p.strokes ? p.strokes.slice() : [[]];
        if (strokes.length === 0) strokes.push([]);
        strokes[strokes.length - 1] = strokes[strokes.length - 1].concat([point]);
        return { ...p, strokes, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  beginStroke: (id: string) => {
    set((state) => ({
      painPoints: state.painPoints.map((p) => {
        if (p.id !== id) return p;
        const strokes = (p.strokes || []).concat([[]]);
        return { ...p, strokes };
      }),
    }));
  },

  endStroke: (_id: string) => {
    // No-op for now; placeholder if we later need to finalize
  },

  undoLastStroke: (id: string) => {
    set((state) => ({
      painPoints: state.painPoints.map((p) => {
        if (p.id !== id) return p;
        const strokes = (p.strokes || []).slice();
        if (strokes.length === 0) return p;
        strokes.pop();
        return { ...p, strokes, updatedAt: new Date().toISOString() };
      }),
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
