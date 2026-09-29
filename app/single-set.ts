// Historical entries that contain a whole session instead of one set.
// Keep their recorded totals, but use the individual sets for PB calculations.
export const COMPOSITE_SESSIONS: Record<string, readonly number[]> = {
  "d32dc5cc-f442-4355-b7eb-2d77f435c8d3": [40, 40], // Felix: 80 total
  "c990a414-f4dc-4a82-98d2-d10d33d977a3": [50, 50], // Felix: 100 total
};

export function singleSetRepetitions(requestId: string, total: number): readonly number[] {
  const sets = COMPOSITE_SESSIONS[requestId];
  return sets && sets.reduce((sum, reps) => sum + reps, 0) === total ? sets : [total];
}
