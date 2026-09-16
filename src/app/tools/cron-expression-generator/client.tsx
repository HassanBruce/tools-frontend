"use client";

import { useMemo, useState } from "react";
import cronstrue from "cronstrue";
import { Button, ErrorNote, Field, Note, Panel, TextInput, Toolbar } from "@/components/ui";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" },
  { label: "Every Monday 8am", value: "0 8 * * 1" },
  { label: "First of the month", value: "0 0 1 * *" },
  { label: "Every Sunday 3am", value: "0 3 * * 0" },
] as const;

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Expand one cron field — a step like */15, a range like 1-5, or a list like
// MON,FRI — into the concrete set of values it matches.
function expandField(field: string, min: number, max: number, names?: string[]): Set<number> {
  const values = new Set<number>();

  for (const part of field.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText ? Number(stepText) : 1;
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in "${part}".`);

    let from = min;
    let to = max;

    if (range !== "*" && range !== "?") {
      const bounds = range.split("-").map((token) => {
        const lower = token.trim().toLowerCase();
        const nameIndex = names?.indexOf(lower) ?? -1;
        const numeric = nameIndex >= 0 ? nameIndex : Number(lower);
        if (!Number.isInteger(numeric)) throw new Error(`Unrecognised value "${token}".`);
        return numeric;
      });

      from = bounds[0];
      to = bounds.length > 1 ? bounds[1] : bounds[0];
      // A bare value with a step means "from here to the end", e.g. 5/10.
      if (bounds.length === 1 && stepText) to = max;
    }

    if (from < min || to > max || to < from) {
      throw new Error(`"${part}" is outside the valid range ${min}-${max}.`);
    }

    for (let value = from; value <= to; value += step) values.add(value);
  }

  return values;
}

interface CronFields {
  minutes: Set<number>;
  hours: Set<number>;
  daysOfMonth: Set<number>;
  months: Set<number>;
  daysOfWeek: Set<number>;
  domRestricted: boolean;
  dowRestricted: boolean;
}

function parseCron(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Expected 5 fields (minute hour day month weekday) but got ${parts.length}.`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const daysOfWeek = expandField(dayOfWeek, 0, 7, DAY_NAMES);
  // Cron accepts both 0 and 7 for Sunday.
  if (daysOfWeek.has(7)) daysOfWeek.add(0);

  return {
    minutes: expandField(minute, 0, 59),
    hours: expandField(hour, 0, 23),
    daysOfMonth: expandField(dayOfMonth, 1, 31),
    months: expandField(month, 1, 12, ["", ...MONTH_NAMES]),
    daysOfWeek,
    domRestricted: dayOfMonth !== "*" && dayOfMonth !== "?",
    dowRestricted: dayOfWeek !== "*" && dayOfWeek !== "?",
  };
}

function matches(date: Date, fields: CronFields): boolean {
  if (!fields.minutes.has(date.getMinutes())) return false;
  if (!fields.hours.has(date.getHours())) return false;
  if (!fields.months.has(date.getMonth() + 1)) return false;

  const domMatch = fields.daysOfMonth.has(date.getDate());
  const dowMatch = fields.daysOfWeek.has(date.getDay());

  // The classic gotcha: when BOTH day fields are restricted, cron runs if
  // EITHER matches — not both.
  if (fields.domRestricted && fields.dowRestricted) return domMatch || dowMatch;
  if (fields.domRestricted) return domMatch;
  if (fields.dowRestricted) return dowMatch;
  return true;
}

/** Step forward a minute at a time, capped so an impossible schedule cannot hang. */
function nextRuns(fields: CronFields, count: number): Date[] {
  const runs: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const limit = 60 * 24 * 400; // ~400 days of minutes
  for (let step = 0; step < limit && runs.length < count; step++) {
    if (matches(cursor, fields)) runs.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return runs;
}

export default function Client() {
  const [expression, setExpression] = useState("0 9 * * 1-5");

  const description = useMemo(() => {
    try {
      return { text: cronstrue.toString(expression, { throwExceptionOnParseError: true }), error: null };
    } catch (caught) {
      return { text: "", error: caught instanceof Error ? caught.message : String(caught) };
    }
  }, [expression]);

  const schedule = useMemo(() => {
    try {
      const fields = parseCron(expression);
      return { runs: nextRuns(fields, 8), error: null, fields };
    } catch (caught) {
      return { runs: [], error: caught instanceof Error ? caught.message : String(caught), fields: null };
    }
  }, [expression]);

  const bothDayFields = schedule.fields?.domRestricted && schedule.fields?.dowRestricted;

  return (
    <>
      <Toolbar>
        <Field label="Cron expression" className="min-w-64 flex-1">
          <TextInput value={expression} onChange={setExpression} placeholder="* * * * *" mono />
        </Field>
      </Toolbar>

      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button key={preset.value} size="sm" onClick={() => setExpression(preset.value)}>
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="In plain English">
          <p className="px-3 py-4 text-lg">
            {description.error ? <span className="text-muted">—</span> : description.text}
          </p>
          <div className="grid grid-cols-5 gap-px border-t border-border bg-border text-center">
            {["minute", "hour", "day", "month", "weekday"].map((label, index) => (
              <div key={label} className="bg-surface px-1 py-2">
                <div className="code-pane text-sm">{expression.trim().split(/\s+/)[index] ?? "—"}</div>
                <div className="mt-0.5 text-[0.65rem] text-muted uppercase">{label}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Next 8 runs">
          {schedule.runs.length > 0 ? (
            <ul className="divide-y divide-border">
              {schedule.runs.map((run) => (
                <li key={run.toISOString()} className="flex justify-between gap-3 px-3 py-2 text-sm">
                  <span className="code-pane">{run.toLocaleString()}</span>
                  <span className="text-xs text-muted">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][run.getDay()]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-muted">
              {schedule.error ? "—" : "This schedule has no runs in the next 400 days."}
            </p>
          )}
        </Panel>
      </div>

      {(description.error || schedule.error) && (
        <ErrorNote>{schedule.error ?? description.error}</ErrorNote>
      )}

      {bothDayFields && (
        <Note tone="warning">
          Both the day-of-month and weekday fields are restricted. Classic cron runs the job when{" "}
          <strong>either</strong> matches, not both — check the run times above carefully.
        </Note>
      )}
    </>
  );
}
