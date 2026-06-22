import { supabase } from "@/lib/supabase";
import type { ConsultantCardData } from "@/types/database";

const MIN_CONSULTANTS = 3;

const FILTERABLE_LANGUAGES: Record<string, string> = {
  pa: "Punjabi",
  hi: "Hindi",
  ur: "Urdu",
  ar: "Arabic",
  es: "Spanish",
  tl: "Tagalog",
  zh: "Mandarin",
  yue: "Cantonese",
  fa: "Farsi",
  fr: "French",
  gu: "Gujarati",
  sr: "Serbian",
  hr: "Croatian",
};

export const LANGUAGE_LABELS = FILTERABLE_LANGUAGES;

export type LanguageCityCombo = {
  city_slug: string;
  lang_code: string;
  consultant_count: number;
};

export type LanguageProvinceTotal = {
  lang_code: string;
  label: string;
  consultant_count: number;
};

type BusinessCardFields = NonNullable<ConsultantCardData["primary_business"]>;

type ConsultantRow = Pick<
  ConsultantCardData,
  | "id"
  | "rcic_number"
  | "slug"
  | "full_name"
  | "primary_city_slug"
  | "language_codes"
  | "service_slugs"
> & {
  consultant_businesses: Array<{
    is_primary: boolean;
    business: BusinessCardFields | BusinessCardFields[] | null;
  }>;
};

function unwrapRelation<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function isFilterableLanguage(code: string): boolean {
  return code in FILTERABLE_LANGUAGES;
}

export function getLanguageLabel(code: string): string | undefined {
  return FILTERABLE_LANGUAGES[code];
}

export async function getLanguageCityCombos(): Promise<LanguageCityCombo[]> {
  const { data: rows } = await supabase
    .from("consultants")
    .select(
      `
      id, language_codes,
      consultant_businesses!inner (
        business:businesses!inner (city_slug)
      )
    `,
    )
    .eq("status", "published");

  if (!rows) return [];

  const tally: Record<string, Record<string, Set<string>>> = {};

  for (const r of rows) {
    const langs = (r.language_codes ?? []) as string[];
    const links = r.consultant_businesses as Array<{
      business: { city_slug: string } | { city_slug: string }[] | null;
    }>;

    const cities = links
      .map((cb) => unwrapRelation(cb.business)?.city_slug)
      .filter((s): s is string => Boolean(s));

    const uniqueCities = Array.from(new Set(cities));

    for (const city of uniqueCities) {
      for (const lang of langs) {
        if (!isFilterableLanguage(lang)) continue;
        tally[city] ??= {};
        tally[city][lang] ??= new Set();
        tally[city][lang].add(r.id as string);
      }
    }
  }

  const combos: LanguageCityCombo[] = [];
  for (const [city, langs] of Object.entries(tally)) {
    for (const [lang, ids] of Object.entries(langs)) {
      if (ids.size >= MIN_CONSULTANTS) {
        combos.push({
          city_slug: city,
          lang_code: lang,
          consultant_count: ids.size,
        });
      }
    }
  }

  return combos;
}

export async function getLanguageProvinceTotals(): Promise<
  LanguageProvinceTotal[]
> {
  const { data: rows } = await supabase
    .from("consultants")
    .select("id, language_codes")
    .eq("status", "published");

  if (!rows) return [];

  const tally: Record<string, Set<string>> = {};

  for (const r of rows) {
    const langs = (r.language_codes ?? []) as string[];
    for (const lang of langs) {
      if (!isFilterableLanguage(lang)) continue;
      tally[lang] ??= new Set();
      tally[lang].add(r.id as string);
    }
  }

  return Object.entries(tally)
    .filter(([, ids]) => ids.size >= MIN_CONSULTANTS)
    .map(([lang, ids]) => ({
      lang_code: lang,
      label: getLanguageLabel(lang) ?? lang,
      consultant_count: ids.size,
    }))
    .sort((a, b) => b.consultant_count - a.consultant_count);
}

function pickBusinessForCity(
  links: ConsultantRow["consultant_businesses"],
  citySlug: string,
): BusinessCardFields | null {
  const inCity = links
    .map((cb) => ({
      is_primary: cb.is_primary,
      business: unwrapRelation(cb.business),
    }))
    .filter((cb) => cb.business?.city_slug === citySlug);

  if (inCity.length === 0) return null;

  const primary = inCity.find((cb) => cb.is_primary);
  return (primary ?? inCity[0]).business ?? null;
}

function toCardData(
  row: ConsultantRow,
  business: BusinessCardFields | null,
): ConsultantCardData {
  return {
    id: row.id,
    rcic_number: row.rcic_number,
    slug: row.slug,
    full_name: row.full_name,
    primary_city_slug: row.primary_city_slug,
    language_codes: row.language_codes ?? [],
    service_slugs: row.service_slugs ?? [],
    primary_business: business,
  };
}

export async function getConsultantsByCityAndLanguage(
  citySlug: string,
  langCode: string,
): Promise<{
  consultants: ConsultantCardData[];
  secondaryIds: Set<string>;
  primaryCityNames: Record<string, string>;
}> {
  const { data: rows } = await supabase
    .from("consultants")
    .select(
      `
      id, rcic_number, slug, full_name, primary_city_slug,
      language_codes, service_slugs,
      consultant_businesses (
        is_primary,
        business:businesses (legal_name, display_name, address, phone, website, city_slug)
      )
    `,
    )
    .eq("status", "published")
    .contains("language_codes", [langCode]);

  if (!rows) {
    return { consultants: [], secondaryIds: new Set(), primaryCityNames: {} };
  }

  const primary: ConsultantCardData[] = [];
  const secondary: ConsultantCardData[] = [];

  for (const raw of rows) {
    const c = raw as ConsultantRow;
    const business = pickBusinessForCity(c.consultant_businesses ?? [], citySlug);
    if (!business) continue;

    const card = toCardData(c, business);
    if (c.primary_city_slug === citySlug) {
      primary.push(card);
    } else {
      secondary.push(card);
    }
  }

  primary.sort((a, b) => a.full_name.localeCompare(b.full_name));
  secondary.sort((a, b) => a.full_name.localeCompare(b.full_name));

  const secondaryIds = new Set(secondary.map((c) => c.id));

  let primaryCityNames: Record<string, string> = {};
  if (secondary.length > 0) {
    const primarySlugs = Array.from(
      new Set(
        secondary
          .map((c) => c.primary_city_slug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    );
    if (primarySlugs.length > 0) {
      const { data: cityRows } = await supabase
        .from("cities")
        .select("slug, name")
        .in("slug", primarySlugs);
      primaryCityNames = Object.fromEntries(
        (cityRows ?? []).map((r) => [r.slug, r.name]),
      );
    }
  }

  return {
    consultants: [...primary, ...secondary],
    secondaryIds,
    primaryCityNames,
  };
}
