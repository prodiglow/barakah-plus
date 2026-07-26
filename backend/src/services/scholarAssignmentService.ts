import { Scholar } from "../models/Scholar";
import { ScholarServices } from "../models/scholarServices";
import { Gender, Sect } from "../constants/scholarMatching";

export type MatchQuality = "exact" | "same_gender" | "any" | "any_scholar";

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
 *   4. any_scholar: any scholar in the system at all, service unfiltered
 *
 * For the Free Personal Dua path (orderTitle !== "Quran Khawani"), the
 * relevant service is "Dua" and is used as a filter at tiers 1-3. For the
 * Quran Khawani path, no service filter is applied at any tier (preserving
 * today's scope for that adjacent flow — no Quran Khawani service entry
 * currently exists).
 *
 * Deliberately has no hardcoded fallback scholar ID: a specific scholar
 * document can be deleted or replaced at any time, and a hardcoded ID that
 * later stops existing produces a silently-dangling reference — the order
 * appears to have a real ScholarID but populates as null everywhere it's
 * displayed. Tier 4 queries the database for any real scholar instead, so
 * this can never point at a scholar that doesn't actually exist.
 *
 * Only throws if the Scholar collection is completely empty.
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

  // 4. Last resort: any scholar in the system at all, verified to actually
  // exist right now rather than trusting a hardcoded ID that might not.
  const anyScholarAtAll = await Scholar.findOne({});
  if (anyScholarAtAll) {
    return { scholarId: anyScholarAtAll._id.toString(), matchQuality: "any_scholar" };
  }

  throw new Error(
    "No scholars exist in the database — cannot assign a scholar for a free-service order."
  );
}
