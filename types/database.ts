export type CiccStatus = "Active" | "Inactive" | "Suspended" | "Revoked";
export type LicenceType = "RCIC" | "RCIC-IRB" | "RISIA";
export type ConsultantStatus = "draft" | "published" | "flagged" | "removed";

export type City = {
  slug: string;
  name: string;
  province: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  intro_md: string | null;
};

export type Service = {
  slug: string;
  name: string;
  short_label: string | null;
  seo_title: string | null;
  seo_description: string | null;
  intro_md: string | null;
};

export type Language = {
  code: string;
  name_en: string;
  name_native: string | null;
};

export type Business = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string | null;
  city_slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  has_physical_office: boolean;
  google_place_id: string | null;
};

export type Consultant = {
  id: string;
  rcic_number: string;
  slug: string;
  full_name: string;
  given_name: string | null;
  family_name: string | null;
  licence_type: LicenceType;
  cicc_status: CiccStatus;
  cicc_verified_on: string;
  primary_city_slug: string | null;
  bio_md: string | null;
  photo_url: string | null;
  free_consultation: boolean | null;
  service_slugs: string[];
  language_codes: string[];
  trust_score: number;
  status: ConsultantStatus;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsultantWithBusinesses = Consultant & {
  businesses: Array<Business & { is_primary: boolean; role_label: string | null }>;
  languages: Language[];
  services: Service[];
};

export type ConsultantCardData = Pick<
  Consultant,
  | "id"
  | "rcic_number"
  | "slug"
  | "full_name"
  | "primary_city_slug"
  | "language_codes"
  | "service_slugs"
> & {
  primary_business: Pick<
    Business,
    "legal_name" | "display_name" | "address" | "phone" | "website" | "city_slug"
  > | null;
};
