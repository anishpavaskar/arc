export interface DomainData {
  task: string;
  done: boolean;
}

export interface DayData {
  date: string;          // "YYYY-MM-DD"
  intent: string;
  body: DomainData;
  build: DomainData;
  exposure: DomainData;
}

export type DomainKey = 'body' | 'build' | 'exposure';

export type Screen = 'today' | 'velocity';

export type VelocityStatus = 'LOCKED IN' | 'MOVING' | 'DRAG DETECTED' | 'FLATLINE';

export interface DayScore {
  date: string;          // "YYYY-MM-DD"
  label: string;         // "Mon", "Tue", etc.
  score: number;         // 0–3
}

export interface WeeklyData {
  days: DayScore[];
  average: number;
  status: VelocityStatus;
  domainCounts: Record<DomainKey, number>;  // each 0–7
}
