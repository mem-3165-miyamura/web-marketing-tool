// lib/services/evaluator.ts
import { TrackingLog, VisitorStatus } from "@prisma/client";
import { DEFAULT_LEAD_RULES, StatusRule } from "../constants/lead-rules";

/**
 * Visitorのログとルールを比較して、新しいステータスを決定する
 */
export function calculateNewStatus(
  logs: TrackingLog[],
  userCustomRules: any // DBの User.statusRules から渡される想定
): VisitorStatus {
  
  // 1. ルールのマージ（ユーザー設定があれば優先、なければデフォルト）
  const rules = {
    PROSPECT: (userCustomRules?.PROSPECT as StatusRule) || DEFAULT_LEAD_RULES.PROSPECT,
    CUSTOMER: (userCustomRules?.CUSTOMER as StatusRule) || DEFAULT_LEAD_RULES.CUSTOMER,
  };

  // 2. ログの解析（PV数と到達ページを確認）
  const pvCount = logs.filter(l => l.eventType === "page_view").length;
  const visitedUrls = logs.map(l => l.pageUrl || "");

  // 3. 判定ロジック（優先度が高い CUSTOMER から順にチェック）
  
  // 顧客(CUSTOMER)判定
  const isCustomer = 
    visitedUrls.some(url => url.includes(rules.CUSTOMER.targetPage || "___NONE___")) ||
    (rules.CUSTOMER.minPV > 0 && pvCount >= rules.CUSTOMER.minPV);

  if (isCustomer) return "CUSTOMER";

  // 検討中(PROSPECT)判定
  const isProspect = 
    visitedUrls.some(url => url.includes(rules.PROSPECT.targetPage || "___NONE___")) ||
    pvCount >= rules.PROSPECT.minPV;

  if (isProspect) return "PROSPECT";

  // どちらでもなければ初期状態
  return "LEAD";
}