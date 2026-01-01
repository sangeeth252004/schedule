// Utility to generate N random, non-overlapping times within a day and window
// minGapMinutes: minimum gap between times (e.g., 10)
// windowStart, windowEnd: 'HH:mm' (e.g., '08:00', '22:00')


// Helper to get a Date object in UTC for a given date and time (no timezone math)
function getUTCDate(dateStr, timeStr) {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm' (UTC)
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
}

export function generateRandomSchedule({
  date, // 'YYYY-MM-DD'
  count, // number of reels
  minGapMinutes = 10,
  windowStart = '12:00', // UTC
  windowEnd = '20:00',   // UTC
}) {
  // Use UTC times for both start and end
  const start = getUTCDate(date, windowStart);
  const end = getUTCDate(date, windowEnd);
  const minGapMs = minGapMinutes * 60 * 1000;
  const totalWindowMs = end - start;
  if (count * minGapMs > totalWindowMs) throw new Error('Not enough time for all reels with the given gap.');
  let slots = [];
  for (let i = 0; i < count; i++) {
    slots.push(i * minGapMs);
  }
  const randomOffsets = slots.map((gap, i) => gap + Math.floor(Math.random() * (totalWindowMs - count * minGapMs) / count));
  randomOffsets.sort((a, b) => a - b);
  return randomOffsets.map(offset => new Date(start.getTime() + offset));
}
