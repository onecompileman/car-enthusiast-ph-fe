export function getInitials(fullName: string): string {
  return fullName
    .split(' ') // split by spaces
    .map((name) => name[0]) // take first letter of each part
    .join('') // join them together
    .toUpperCase(); // ensure uppercase
}
