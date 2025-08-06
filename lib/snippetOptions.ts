// Language options for code snippets
export const LANGUAGE_OPTIONS = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php',
  'ruby', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
  'scss', 'json', 'xml', 'yaml', 'bash', 'powershell', 'dockerfile', 'nginx'
] as const;

// Category options for code snippets
export const CATEGORY_OPTIONS = [
  'Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Desktop', 'Algorithm',
  'Data Structure', 'Utility', 'Configuration', 'Testing', 'Documentation'
] as const;

// Type definitions for better type safety
export type Language = typeof LANGUAGE_OPTIONS[number];
export type Category = typeof CATEGORY_OPTIONS[number];

// Helper function to get display name for language
export const getLanguageDisplayName = (language: Language): string => {
  return language.charAt(0).toUpperCase() + language.slice(1);
};

// Helper function to get all languages with their display names
export const getLanguageOptions = () => {
  return LANGUAGE_OPTIONS.map(lang => ({
    value: lang,
    label: getLanguageDisplayName(lang)
  }));
};

// Helper function to get all categories
export const getCategoryOptions = () => {
  return CATEGORY_OPTIONS.map(cat => ({
    value: cat,
    label: cat
  }));
}; 