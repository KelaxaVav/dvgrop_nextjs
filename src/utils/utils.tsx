export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function removeEmptyFields<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj)
    .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}
