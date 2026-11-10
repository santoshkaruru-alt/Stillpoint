/**
 * One short line shown on Home, changing each day. Original wording; edit
 * or add freely.
 */
export const dailyLines: string[] = [
  'You are already here. Begin from here.',
  'Slow the breath, and the day slows with it.',
  'Nothing to fix. Only something to notice.',
  'Let the next breath be the whole of your task.',
  'Stillness is not empty. It is full of room.',
  'Feel it first. The rest follows.',
  'Rest is part of the practice.',
  'Return, gently, as many times as it takes.',
  'The future you are choosing begins in this breath.',
  'Soft shoulders. Open heart. Clear eyes.',
  'Where attention rests, life grows.',
  'Breathe in what you need. Let go of what you do not.',
  'Small, quiet minutes add up to a different life.',
  'Be the calm you are looking for.',
];

/** The same line all day, a new one tomorrow. */
export function lineForToday(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return dailyLines[day % dailyLines.length];
}
