export type TaskWeight = 'maintain' | 'advance' | 'expand';

export interface DomainData {
  task: string;
  done: boolean;
  weight: TaskWeight | null;
}

export interface DayData {
  date: string;          // "YYYY-MM-DD"
  intent: string;
  committed: boolean;    // true = intent locked in, task inputs frozen
  body: DomainData;
  build: DomainData;
  exposure: DomainData;
}

export type DomainKey = 'body' | 'build' | 'exposure';

export type Screen = 'today' | 'velocity';

export type VelocityStatus = 'LOCKED IN' | 'MOVING' | 'DRAG DETECTED' | 'FLATLINE';

/** Three possible day states */
export type DayState = 'ghost' | 'present' | 'active';

export interface DayScore {
  date: string;          // "YYYY-MM-DD"
  label: string;         // "Mon", "Tue", etc.
  score: number;         // 0-3
  state: DayState;       // ghost, present, or active
}

export interface WeeklyData {
  days: DayScore[];       // Always Mon-Sun (7 entries, future days excluded)
  average: number;        // Based only on non-ghost days
  status: VelocityStatus;
  domainCounts: Record<DomainKey, number>;  // each 0-7
  dayOfWeek: number;      // 1=Mon, 7=Sun - for early-week dimming logic
}
