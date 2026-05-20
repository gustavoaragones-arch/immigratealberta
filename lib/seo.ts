export function substituteCity(template: string | null, cityName: string): string {
  if (!template) return "";
  return template.replace(/\{city\}/g, cityName);
}
