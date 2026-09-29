import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const athletes = sqliteTable("athletes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull().default(""),
  country: text("country").notNull(),
  birthDate: text("birth_date").notNull().default(""),
  ownerUserId: text("owner_user_id").notNull().default(""),
  gender: text("gender").notNull().default("male"),
  profilePhotoKey: text("profile_photo_key"),
  profilePhotoType: text("profile_photo_type"),
  athleteNumber: integer("athlete_number").notNull(),
  trainingLogPublic: integer("training_log_public", { mode: "boolean" }).notNull().default(false),
  trainingLogPublicScope: text("training_log_public_scope").notNull().default("all"),
  trainingLogPublicUntil: text("training_log_public_until"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_athletes_owner_user_id").on(table.ownerUserId).where(sql`${table.ownerUserId} <> ''`),
  uniqueIndex("idx_athletes_athlete_number").on(table.athleteNumber),
]);

export const athleteNumberSequence = sqliteTable("athlete_number_sequence", {
  id: integer("id").primaryKey(),
  nextNumber: integer("next_number").notNull(),
});

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  athleteId: text("athlete_id").notNull().references(() => athletes.id),
  requestId: text("request_id").notNull(),
  reps: integer("reps").notNull(),
  entryDate: text("entry_date").notNull(),
  source: text("source").notNull().default("human-choice"),
  evidenceKey: text("evidence_key"),
  evidenceType: text("evidence_type"),
  editedAt: text("edited_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_entries_athlete_date").on(table.athleteId, table.entryDate),
  index("idx_entries_date").on(table.entryDate),
  uniqueIndex("idx_entries_request_id").on(table.requestId),
]);

export const challenges = sqliteTable("challenges", {
  ownerUserId: text("owner_user_id").primaryKey(),
  days: integer("days").notNull(),
  target: integer("target").notNull(),
  start: text("start").notNull(),
  total: integer("total").notNull().default(0),
  today: integer("today").notNull().default(0),
  todayDate: text("today_date").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const roadPlans = sqliteTable("road_plans", {
  ownerUserId: text("owner_user_id").primaryKey(),
  day: integer("day").notNull().default(1),
  maxReps: integer("max_reps").notNull().default(0),
  doneJson: text("done_json").notNull().default("[]"),
  actualsJson: text("actuals_json").notNull().default("{}"),
  adaptiveJson: text("adaptive_json").notNull().default("{}"),
  planDate: text("plan_date").notNull(),
  actualDay: text("actual_day").notNull(),
  celebrated: integer("celebrated", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
