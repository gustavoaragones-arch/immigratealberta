import { cache } from "react";
import { supabase } from "./supabase";
import type {
  Business,
  Consultant,
  ConsultantCardData,
  ConsultantWithBusinesses,
  Language,
  Service,
} from "@/types/database";

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function mapBusiness(row: Business): Business {
  return {
    ...row,
    lat: num(row.lat),
    lng: num(row.lng),
    has_physical_office: Boolean(row.has_physical_office),
  };
}

function mapConsultant(row: Consultant): Consultant {
  return {
    ...row,
    trust_score: Number(row.trust_score ?? 0),
    service_slugs: row.service_slugs ?? [],
    language_codes: row.language_codes ?? [],
    licence_type: row.licence_type as Consultant["licence_type"],
    cicc_status: row.cicc_status as Consultant["cicc_status"],
    status: row.status as Consultant["status"],
  };
}

export async function getConsultantBySlug(
  slug: string,
): Promise<ConsultantWithBusinesses | null> {
  const { data: raw, error } = await supabase
    .from("consultants")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !raw) return null;

  const consultant = mapConsultant(raw as Consultant);

  const { data: links } = await supabase
    .from("consultant_businesses")
    .select("is_primary, role_label, business:businesses(*)")
    .eq("consultant_id", consultant.id);

  function unwrapBusiness<T>(b: T | T[] | null): T | null {
    if (b == null) return null;
    return Array.isArray(b) ? (b[0] ?? null) : b;
  }

  const businesses = (links ?? [])
    .map((row) => {
      const raw = row as {
        is_primary: boolean;
        role_label: string | null;
        business: Business | Business[] | null;
      };
      const biz = unwrapBusiness<Business>(raw.business);
      if (!biz) return null;
      return {
        ...mapBusiness(biz),
        is_primary: raw.is_primary,
        role_label: raw.role_label,
      };
    })
    .filter(Boolean) as ConsultantWithBusinesses["businesses"];

  businesses.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  const langCodes = consultant.language_codes ?? [];
  const serviceSlugs = consultant.service_slugs ?? [];

  const [languagesRes, servicesRes] = await Promise.all([
    langCodes.length
      ? supabase.from("languages").select("*").in("code", langCodes)
      : Promise.resolve({ data: [] as Language[] }),
    serviceSlugs.length
      ? supabase.from("services").select("*").in("slug", serviceSlugs)
      : Promise.resolve({ data: [] as Service[] }),
  ]);

  return {
    ...consultant,
    businesses,
    languages: (languagesRes.data ?? []) as Language[],
    services: (servicesRes.data ?? []) as Service[],
  };
}

export async function getAllConsultantSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from("consultants")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((c) => c.slug);
}

type ConsultantListRow = Pick<
  Consultant,
  | "id"
  | "rcic_number"
  | "slug"
  | "full_name"
  | "primary_city_slug"
  | "language_codes"
  | "service_slugs"
>;

type BusinessCardFields = NonNullable<ConsultantCardData["primary_business"]>;

function unwrapRelation<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toCardData(
  row: ConsultantListRow,
  business: BusinessCardFields | null,
): ConsultantCardData {
  return {
    ...row,
    language_codes: row.language_codes ?? [],
    service_slugs: row.service_slugs ?? [],
    primary_business: business,
  };
}

export type ConsultantsByCityResult = {
  consultants: ConsultantCardData[];
  secondaryIds: Set<string>;
  primaryCityNames: Record<string, string>;
};

export async function getConsultantsByCity(
  citySlug: string,
): Promise<ConsultantsByCityResult> {
  return fetchCityConsultants(citySlug, null);
}

/**
 * Consultants with any office (primary or secondary) in the city, optionally
 * limited to those offering a service. Primary-city consultants first, then
 * secondary-office consultants, each sorted by name.
 */
async function fetchCityConsultants(
  citySlug: string,
  serviceSlug: string | null,
): Promise<ConsultantsByCityResult> {
  const consultantSelect =
    "id, rcic_number, slug, full_name, primary_city_slug, language_codes, service_slugs";

  let primaryQuery = supabase
    .from("consultants")
    .select(consultantSelect)
    .eq("primary_city_slug", citySlug)
    .eq("status", "published");
  if (serviceSlug) {
    primaryQuery = primaryQuery.contains("service_slugs", [serviceSlug]);
  }
  const { data: primary } = await primaryQuery.order("full_name", {
    ascending: true,
  });

  const { data: secondaryLinks } = await supabase
    .from("consultant_businesses")
    .select(
      `consultant:consultants!inner (${consultantSelect}, status),
       business:businesses!inner (legal_name, display_name, address, phone, website, city_slug)`,
    )
    .eq("business.city_slug", citySlug)
    .eq("consultant.status", "published");

  const primaryRows = (primary ?? []) as ConsultantListRow[];

  const secondaryById = new Map<
    string,
    { consultant: ConsultantListRow; business: BusinessCardFields }
  >();

  for (const link of secondaryLinks ?? []) {
    const row = link as {
      consultant:
        | (ConsultantListRow & { status: string })
        | (ConsultantListRow & { status: string })[]
        | null;
      business: BusinessCardFields | BusinessCardFields[] | null;
    };
    const consultant = unwrapRelation(row.consultant);
    const business = unwrapRelation(row.business);
    if (!consultant || !business) continue;
    if (consultant.primary_city_slug === citySlug) continue;
    if (serviceSlug && !(consultant.service_slugs ?? []).includes(serviceSlug)) {
      continue;
    }
    if (!secondaryById.has(consultant.id)) {
      secondaryById.set(consultant.id, { consultant, business });
    }
  }

  const secondaryConsultants = Array.from(secondaryById.values()).sort((a, b) =>
    a.consultant.full_name.localeCompare(b.consultant.full_name),
  );

  const secondaryIds = new Set(
    secondaryConsultants.map(({ consultant }) => consultant.id),
  );

  let primaryCityNames: Record<string, string> = {};
  if (secondaryConsultants.length > 0) {
    const primaryCitySlugs = Array.from(
      new Set(
        secondaryConsultants
          .map(({ consultant }) => consultant.primary_city_slug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    );
    if (primaryCitySlugs.length > 0) {
      const { data: cityRows } = await supabase
        .from("cities")
        .select("slug, name")
        .in("slug", primaryCitySlugs);
      primaryCityNames = Object.fromEntries(
        (cityRows ?? []).map((r) => [r.slug, r.name]),
      );
    }
  }

  const primaryIds = primaryRows.map((c) => c.id);
  const businessByConsultantId = new Map<string, BusinessCardFields>();

  if (primaryIds.length > 0) {
    const { data: links } = await supabase
      .from("consultant_businesses")
      .select(
        "consultant_id, business:businesses(legal_name, display_name, address, phone, website, city_slug)",
      )
      .in("consultant_id", primaryIds)
      .eq("is_primary", true);

    for (const link of links ?? []) {
      const row = link as {
        consultant_id: string;
        business: BusinessCardFields | BusinessCardFields[] | null;
      };
      const biz = unwrapRelation(row.business);
      if (biz) businessByConsultantId.set(row.consultant_id, biz);
    }
  }

  const consultants = [
    ...primaryRows.map((c) =>
      toCardData(c, businessByConsultantId.get(c.id) ?? null),
    ),
    ...secondaryConsultants.map(({ consultant, business }) =>
      toCardData(consultant, business),
    ),
  ];

  return { consultants, secondaryIds, primaryCityNames };
}

export async function getCity(slug: string) {
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    lat: num(data.lat),
    lng: num(data.lng),
    is_active: Boolean(data.is_active),
  };
}

export async function getAllCitySlugs(): Promise<string[]> {
  const { data } = await supabase.from("cities").select("slug");
  return (data ?? []).map((c) => c.slug);
}

/**
 * Fetch all canonical services (excluding the 'general' default).
 * Used to render the filter pill row.
 */
export async function getFilterableServices(): Promise<Service[]> {
  const { data } = await supabase
    .from("services")
    .select("*")
    .neq("slug", "general");

  const order = [
    "pr-express-entry",
    "provincial-nominee",
    "study-permit",
    "work-permit-lmia",
    "family-sponsorship",
    "visitor-super-visa",
    "citizenship",
    "refugee-irb",
  ];
  return (data ?? []).sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  );
}

/**
 * Same as getConsultantsByCity (primary + secondary offices), but only
 * consultants who offer the given service.
 */
export async function getConsultantsByCityAndService(
  citySlug: string,
  serviceSlug: string,
): Promise<ConsultantsByCityResult> {
  return fetchCityConsultants(citySlug, serviceSlug);
}

/**
 * Number of consultants a city × service page lists before falling back to
 * the full city list. Uses getConsultantsByCityAndService itself so the
 * count can never drift from what the page renders. 0 = the page is a
 * near-duplicate of the city hub and should stay out of the index.
 */
export const getServiceMatchCount = cache(
  async (citySlug: string, serviceSlug: string): Promise<number> => {
    const { consultants } = await getConsultantsByCityAndService(
      citySlug,
      serviceSlug,
    );
    return consultants.length;
  },
);

/**
 * Look up a single service by slug for SEO metadata + page heading.
 */
export async function getService(slug: string): Promise<Service | null> {
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

/**
 * For generateStaticParams on the service filter route.
 * Returns every (city, service) combination.
 */
export async function getAllCityServiceCombos(): Promise<
  { city: string; serviceUrlSlug: string }[]
> {
  const services = await getFilterableServices();
  const { data: cities } = await supabase.from("cities").select("slug");
  if (!cities) return [];

  const combos: { city: string; serviceUrlSlug: string }[] = [];
  for (const c of cities) {
    for (const s of services) {
      combos.push({ city: c.slug, serviceUrlSlug: `${s.slug}-consultants` });
    }
  }
  return combos;
}
