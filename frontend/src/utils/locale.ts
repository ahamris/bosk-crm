export function localizedName(
  obj: { name_nl?: string; name_en?: string; name_ru?: string },
  lang: string
): string {
  const key = `name_${lang}` as keyof typeof obj;
  return obj[key] || obj.name_nl || obj.name_en || '';
}
