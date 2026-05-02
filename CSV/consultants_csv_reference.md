# Consultants CSV — Field Reference

This document defines every column in `consultants_template.csv`. The Phase 2 import script validates against these rules and **fails loudly** on anything that doesn't match. The whole point is to catch typos at import time, not after a row is live.

**Encoding:** UTF-8, no BOM. **Delimiter:** comma. **Quoting:** any field containing a comma, semicolon, double quote, or newline must be wrapped in double quotes. Inside a quoted field, escape `"` as `""`.

**Multi-value fields** (`services`, `languages`) use **semicolons**, not commas. This avoids quoting headaches.

**Boolean fields:** `true` or `false`, lowercase, exactly. Empty = unknown (treated as `null`, not `false`).

**Date fields:** ISO 8601 (`YYYY-MM-DD`).

---

## Column-by-column

### `rcic_number` — required
Format: `R` + 6 digits, e.g. `R123456`. Regex `^R[0-9]{6}$`. Must be unique across the entire CSV. The importer rejects duplicates.

### `full_name` — required
Display name as it appears on the CICC register. Title case. No prefixes (no "Mr.", "Ms.", "Dr."). Suffixes like "Jr." are fine.

### `given_name` — required
First name. Used for slug generation and search.

### `family_name` — required
Last name. Used for slug generation and alphabetical sort fallback.

The slug is auto-generated as `slugify(full_name) + '-' + rcic_number.toLowerCase()`. Example: `jane-marie-doe-r123456`. You don't fill this in.

### `licence_type` — required
One of exactly:
- `RCIC` — Regulated Canadian Immigration Consultant
- `RCIC-IRB` — RCIC with Immigration and Refugee Board authorization
- `RISIA` — Regulated International Student Immigration Advisor

Anything else fails the import.

### `cicc_status` — required
One of exactly:
- `Active`
- `Inactive`
- `Suspended`
- `Revoked`

Only `Active` consultants get `status='published'` in the database. Everything else is imported but flagged — you keep the row for audit history but it doesn't appear on the public site.

### `cicc_verified_on` — required
The date **you** confirmed this consultant on the CICC public register. Format: `YYYY-MM-DD`. This is the field that populates the "Verified on [date]" microcopy on the consultant's public page. Re-import with an updated date when you re-verify.

### `primary_city` — required
City slug, lowercase, hyphenated. Currently valid:
- `calgary`
- `edmonton`
- `red-deer`

The importer rejects any other value. To add a city, you add a row to the `cities` table first, then update the CSV. Don't put `"Fort McMurray"` in this field hoping it'll work — it won't.

### `business_legal_name` — required
The official registered name. Used as the upsert key for the `businesses` table along with the city, so spelling consistency matters. **Pick a canonical form and stick to it.** "Doe Immigration Services Inc." and "Doe Immigration Services" will create two separate businesses.

Recommendation: always include the legal suffix (`Inc.`, `Ltd.`, `Corp.`, `Professional Corporation`) if it appears on their official documents.

### `business_address` — required if `has_physical_office=true`, optional otherwise
Full street address including postal code. Must be wrapped in double quotes because it contains commas. Format:
```
"123 8th Ave SW Suite 400, Calgary, AB T2P 1B4"
```
Postal code with a single space (Canadian standard). The importer doesn't geocode; you don't need lat/lng — that's added later when needed for a map view.

### `business_phone` — required
E.164 format: `+1` followed by 10 digits, no spaces or dashes. Example: `+14035551234`. The importer normalizes other formats but it's safer to enter them clean.

### `business_website` — required for publication
Full URL with `https://`. No trailing slash. Used both as the website link on the listing and (later, when you need it) as the source the discovery script regexes for R-numbers. Consultants without a website can be imported but won't reach the trust threshold for prominent ranking.

### `business_email` — required
Where lead notifications get sent. This is where the revenue flows in v1, so accuracy matters. Must be a working inbox; bounces will mean leads vanish silently. Test by sending yourself a message before importing.

### `has_physical_office` — required, boolean
`true` if the business has a real, walk-in office at the address listed. `false` for virtual-only / home-office / mailbox-only. This is a major trust signal — be honest. The trust score gives a `× 1.30` multiplier for `true`, so this is the single highest-impact field after the consultant's existence itself.

How to verify when you're not sure: Google Street View the address. If it's a residential building or a UPS Store, it's `false`.

### `free_consultation` — boolean (nullable)
`true`, `false`, or empty. Empty means you couldn't determine it, and the badge won't show — better than a wrong claim. Only mark `true` when explicitly stated on the consultant's site or by direct confirmation. This is regulated-services advertising; misrepresenting it would be a real liability.

### `services` — required, semicolon-separated
At least one value. Valid slugs:
- `pr` — Permanent Residence (general)
- `express-entry` — Express Entry program
- `family-sponsorship` — spouse, parent, child sponsorship
- `study-permit` — study permits, student visa
- `work-permit` — work permits (general)
- `lmia` — LMIA / Labour Market Impact Assessment
- `refugee` — refugee claims, humanitarian and compassionate
- `citizenship` — citizenship applications, certificates

Example: `pr;express-entry;family-sponsorship`. Order doesn't matter — the importer sorts.

**Curate, don't pad.** A consultant who lists 8 services gets a trust-score penalty (specialists rank above generalists). If they truly do everything, list everything — but if you're padding, you're hurting their ranking.

### `languages` — required, semicolon-separated
At least one value. Valid codes (ISO 639-1 mostly, with diaspora-relevant additions):
- `en` — English
- `fr` — French
- `es` — Spanish
- `pa` — Punjabi
- `hi` — Hindi
- `ur` — Urdu
- `zh` — Chinese (Mandarin or Cantonese — combined for v1)
- `ar` — Arabic
- `tl` — Tagalog / Filipino
- `tr` — Turkish
- `pt` — Portuguese
- `vi` — Vietnamese
- `ko` — Korean
- `ru` — Russian
- `uk` — Ukrainian
- `fa` — Persian / Farsi
- `am` — Amharic
- `so` — Somali

Example: `en;pa;hi;ur`. To add a language not on this list, insert a row into the `languages` table first.

These are the languages with meaningful Alberta diaspora populations driving immigration demand. Don't list a language because the consultant studied it in school for two years — list it because they'd actually conduct a consultation in it.

### `role_label` — optional
Free text. Examples: `Founder`, `Principal Consultant`, `Senior Consultant`, `Owner`, `Partner`. Displayed on the consultant page next to the business name. If empty, just shows the business name.

### `bio_md` — optional but recommended
Markdown-supported. Recommended length 200-600 characters. Earns a `× 1.10` trust-score multiplier when present and >200 chars.

Style guide for bios:
- Third person ("Jane has...", not "I have...")
- Lead with experience: licensure year + practice focus
- Mention Alberta connection if relevant (settlement work, language community ties)
- No marketing fluff ("dedicated", "passionate", "trusted") — let the verification do that work
- No claims you can't back up ("100% success rate", "best in Calgary")

If you don't have a bio yet, leave empty. A missing bio is better than a bad bio.

### `photo_url` — optional
Full HTTPS URL to a headshot. Recommended: square crop, minimum 400×400, neutral background (the site bg `#faf9f7` is ideal but not required). Earns a `× 1.10` trust-score multiplier.

Hosting: Supabase Storage bucket `consultant-photos` is fine for v1. Keep filenames as `{rcic_number}.jpg`. If empty, the consultant card displays an initials avatar — works fine, looks clean.

---

## Common import errors and how to avoid them

**"Invalid service slug 'permanent-residence'"** — you wrote out the name. The slug is `pr`. The full names are display labels stored in the `services` table; the CSV uses slugs.

**"Duplicate rcic_number R123456"** — you have the same R-number on two rows. If a consultant works at two businesses, that's handled by adding two business associations through a different mechanism (see below); not by duplicating the consultant row.

**"Business 'Doe Immigration' not unique within Calgary"** — likely a typo. Check whether you have `Doe Immigration` and `Doe Immigration Inc.` — these will become two separate businesses unless you align the spelling.

**"cicc_status='Active' but cicc_verified_on is more than 90 days ago"** — the importer warns (doesn't fail) when verification is stale. You're claiming Active without recent evidence. Re-verify on the CICC register and update the date.

**"has_physical_office=true but business_address is empty"** — fail. If they have an office, the address must be there.

---

## Handling consultants at multiple businesses

The CSV format gives you **one row per consultant**, with their **primary** business filled in. To associate a consultant with additional businesses, use a second CSV: `consultant_business_links.csv`.

```
rcic_number,business_legal_name,business_city,role_label,is_primary
R123456,Doe Immigration Services Inc.,calgary,Founder & Senior Consultant,true
R123456,Calgary Immigration Group,calgary,Of Counsel,false
```

The importer:
1. Processes `consultants.csv` first — creates consultants and primary business links.
2. Then processes `consultant_business_links.csv` — adds secondary associations.
3. Refuses to demote an `is_primary=true` row through the secondary file (one primary per consultant, enforced at the DB level).

You only need this second file when a consultant genuinely works at two firms. For v1, expect this to be rare — most consultants have one business.

---

## Workflow recommendation

1. **Maintain the master in Google Sheets**, not directly in CSV. Set up data-validation dropdowns on `licence_type`, `cicc_status`, `primary_city`, `services` (use a multi-select extension or a regex validation), `languages`, and the boolean fields.
2. **Verify each consultant on the CICC register the same day** you fill in `cicc_verified_on`. Don't batch — verification dates that all match the import date look automated and aren't credible if challenged.
3. **Export to CSV when ready to import**: File → Download → Comma Separated Values. Save as `data/consultants.csv` in the repo (`.gitignore` it — this isn't repo content).
4. **Run import in dry-run mode first**: `npx tsx scripts/import.ts --dry-run` (the script supports this flag). Read the summary. If it says "would publish 47, would flag 3, would skip 0" — proceed without the flag.
5. **Commit the `import_batches` row's notes** to your operational log: which CSV file, how many rows, who did the verification.
