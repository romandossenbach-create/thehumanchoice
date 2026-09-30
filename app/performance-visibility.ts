// D1 is server-only. Every community performance query must use this rule.
export const PUBLIC_PERFORMANCE_SQL = "a.private_mode = 0";
export const PRIVATE_ACTIVITY_MESSAGE = "This athlete keeps their training activity private.";
export type PerformanceAccess = { ownerUserId:string; privateMode:number|boolean; permanentlyPublic:number|boolean; temporarilyPublic:number|boolean; publicScope:string };
export function canViewAthletePerformance(viewer:{id:string}|null, athlete:PerformanceAccess) {
  if (viewer && viewer.id === athlete.ownerUserId) return true;
  return !athlete.privateMode && Boolean(athlete.permanentlyPublic || athlete.temporarilyPublic);
}
// Future challenge overrides must be explicit and bound to exactly one activity.
export function canViewChallenge(viewer:{id:string}|null, athlete:PerformanceAccess, explicitlyShared = false) {
  return Boolean(viewer && viewer.id === athlete.ownerUserId) || explicitlyShared || (!athlete.privateMode && canViewAthletePerformance(viewer, athlete));
}
