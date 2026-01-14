// lib/constants/lead-rules.ts
import { VisitorStatus } from "@prisma/client";

export interface StatusRule {
  minPV: number;
  targetPage?: string;
}

// ユーザーが何も設定していない時に使われる「標準のルール」
export const DEFAULT_LEAD_RULES: Record<string, StatusRule> = {
  PROSPECT: {
    minPV: 3,
    targetPage: "/pricing",
  },
  CUSTOMER: {
    minPV: 1,
    targetPage: "/thanks",
  },
};