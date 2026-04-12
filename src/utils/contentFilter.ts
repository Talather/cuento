import { bannedWords } from './bannedWords';

export const checkForBannedWords = (text: string): string | null => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Check each banned word pattern
  for (const pattern of bannedWords) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerText)) {
      return pattern.replace('.*', ''); // Return the base word that matched
    }
  }

  return null;
};