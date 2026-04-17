import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SectorKey =
  | 'agriculture' | 'oil_gas' | 'insurance' | 'manufacturing'
  | 'fintech' | 'power' | 'transport';

export type SegmentKey = 'retail' | 'corporate' | 'commercial';

export type ZoneKey =
  | 'north_central' | 'north_east' | 'north_west'
  | 'south_east' | 'south_south' | 'south_west';

interface FilterState {
  sector:     SectorKey | null;
  segment:    SegmentKey | null;
  zone:       ZoneKey | null;
  setSector:  (s: SectorKey | null) => void;
  setSegment: (s: SegmentKey | null) => void;
  setZone:    (z: ZoneKey | null) => void;
  clearAll:   () => void;
}

const FilterContext = createContext<FilterState | null>(null);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sector,  setSector]  = useState<SectorKey | null>(null);
  const [segment, setSegment] = useState<SegmentKey | null>(null);
  const [zone,    setZone]    = useState<ZoneKey | null>(null);

  const clearAll = () => { setSector(null); setSegment(null); setZone(null); };

  return (
    <FilterContext.Provider value={{ sector, segment, zone, setSector, setSegment, setZone, clearAll }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterState => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be inside <FilterProvider>');
  return ctx;
};
