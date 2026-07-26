import { Scholar } from "../models/Scholar";
import { ScholarServices } from "../models/scholarServices";
import { Gender, Sect } from "../constants/scholarMatching";

// Pre-existing, manually-created fallback scholar that is already live in the
// production database (Atlas `barakahDB`). This is the last-resort match used
// when no scholar satisfies any tier of the matching chain below.
export const FALLBACK_SCHOLAR_ID = "68f096b14829b2ccef2c6e3e";

export type MatchQuality = "exact" | "same_gender" | "any" | "fallback";

export interface ScholarAssignmentResult {
  scholarId: string;
  matchQuality: MatchQuality;
}

/**
 * Assigns a scholar for a free/auto-assigned order (Free Personal Dua or
 * Quran Khawani), matching on gender and sect with a graceful fallback chain:
 *
 *   1. exact:       gender + sect + offers the relevant service
 *   2. same_gender:  gender only + offers the relevant service
 *   3. any:         any scholar offering the relevant service
 *   4. fallback:    the pre-existing hardcoded fallback scholar
 *
 * For the Free Personal Dua path (orderTitle !== "Quran Khawani"), the
 * relevant service is "Dua" and is used as a filter at every tier. For the
 * Quran Khawani path, no service filter is applied at any tier (preserving
 * today's scope for that adjacent flow — no Quran Khawani service entry
 * currently exists).
 *
 * Only throws if the Scholar collection is completely empty (which should
 * never happen given the fallback constant is a real, live document).
 */
export async function assignScholarForFreeService(
  gender: string,
  sect: string,
  orderTitle: string
): Promise<ScholarAssignmentResult> {
  const isQuranKhawani = orderTitle === "Quran Khawani";

  let serviceId: unknown = null;
  if (!isQuranKhawani) {
    const duaService = await ScholarServices.findOne({ name: "Dua" });
    if (!duaService) {
      console.warn(
        "⚠️ ScholarServices document named 'Dua' not found — proceeding without a service filter for scholar matching."
      );
    } else {
      serviceId = duaService._id;
    }
  }

  const baseFilter: Record<string, unknown> = {};
  if (serviceId) {
    baseFilter.scholarServices = serviceId;
  }

  // 1. Exact match: gender + sect (+ service, if applicable)
  const exactMatch = await Scholar.findOne({
    ...baseFilter,
    gender: gender as Gender,
    sect: sect as Sect,
  });
  if (exactMatch) {
    return { scholarId: exactMatch._id.toString(), matchQuality: "exact" };
  }

  // 2. Same gender, any sect (+ service, if applicable)
  const sameGenderMatch = await Scholar.findOne({
    ...baseFilter,
    gender: gender as Gender,
  });
  if (sameGenderMatch) {
    return { scholarId: sameGenderMatch._id.toString(), matchQuality: "same_gender" };
  }

  // 3. Any scholar offering the service (any gender/sect)
  const anyMatch = await Scholar.findOne(baseFilter);
  if (anyMatch) {
    return { scholarId: anyMatch._id.toString(), matchQuality: "any" };
  }

  // 4. Last resort: pre-existing hardcoded fallback scholar
  return { scholarId: FALLBACK_SCHOLAR_ID, matchQuality: "fallback" };
}
