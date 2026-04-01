import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  activeLocationId: number | null;
  setActiveLocation: (id: number) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      activeLocationId: null,
      setActiveLocation: (id: number) => set({ activeLocationId: id }),
    }),
    { name: 'bosk-location' }
  )
);
