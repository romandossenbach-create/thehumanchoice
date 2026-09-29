import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../public/road-to-100/adaptive-coach.js", import.meta.url), "utf8");

test("the final set completes without starting another pause", () => {
  const completionCheck = source.indexOf("const completed = Object.keys(state.actuals).length >= plan.sets;");
  const finishBranch = source.indexOf("if (completed) finishTraining();", completionCheck);
  const pauseBranch = source.indexOf("else startPause(", finishBranch);
  assert.ok(completionCheck >= 0 && finishBranch > completionCheck && pauseBranch > finishBranch);
  assert.equal(source.slice(completionCheck, finishBranch).includes("startPause("), false);
});

test("an unchanged training day reuses its stored adaptive plan", () => {
  assert.match(source, /todayPlan && state\.adaptive\.todayPlanDate === state\.date/);
  assert.doesNotMatch(source, /Math\.random/);
});

test("completion motivation is separate and varied", () => {
  assert.match(source, /Bravo! 💪/);
  assert.match(source, /Stark gemacht! 🔥/);
  assert.match(source, /Geschafft! 👏/);
});
