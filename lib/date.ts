const MONTH_INDEX_MAP: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

export const getMonthIndex = (monthLabel: string): number | null =>
  MONTH_INDEX_MAP[monthLabel] ?? null;

export const TIMELINE_OPTIONS = [
  "1month",
  "3months",
  "6months",
  "1year",
  "all",
] as const;

export type TimelineValue = (typeof TIMELINE_OPTIONS)[number];

export const TIMELINE_LABELS: Record<TimelineValue, string> = {
  "1month": "Last 1 month",
  "3months": "Last 3 months",
  "6months": "Last 6 months",
  "1year": "Last 1 year",
  all: "All time",
};

const TIMELINE_MONTHS: Record<TimelineValue, number | null> = {
  "1month": 1,
  "3months": 3,
  "6months": 6,
  "1year": 12,
  all: null,
};

export const isValidTimeline = (timeline: string): timeline is TimelineValue =>
  TIMELINE_OPTIONS.includes(timeline as TimelineValue);

export const getTimelineStartDate = (
  timeline: TimelineValue
): Date | null => {
  const months = TIMELINE_MONTHS[timeline];
  if (months === null) {
    return null;
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setMonth(startDate.getMonth() - months);
  return startDate;
};
