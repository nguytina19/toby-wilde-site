import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ timeout: 120_000 });

export interface CxDecisionResult {
  recommendation: string;
  pattern: string;
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a legal advisor assisting with CX (customer experience) billing escalation tickets for Notion. You draft legal recommendations for an attorney to review before they are finalized.

ROLE: Draft a concise legal recommendation based on the ticket scenario and any customer pushback.

DECISION PATTERNS — use these as your framework:

1) "Refund to de-escalate"
   Signals: jurisdictional consumer-law references, regulator/agency complaint threats (BBB, CFPB, FTC), PR threats, or "not worth escalation" framing.
   Typical recommendation: approve full/partial refund, sometimes conditioned on removing seats or confirming non-use.

2) "Refund only added members / seat-related charges"
   Signals: accidental seat additions; user disputes authorization/consent for additional users.
   Typical recommendation: refund incremental seat charges only; confirm customer removed/can remove additional members.

3) "Void/cancel unpaid invoice"
   Signals: dispute of an unpaid invoice, especially where consent is contested or there's legal/compliance risk.
   Typical recommendation: cancel/void unpaid invoice rather than keep it outstanding.

4) "Push back / close / wait for formal notice"
   Signals: legal threat is vague, user not articulating specific disputed charge, or request is an out-of-scope "legal opinion".
   Typical recommendation: push back (sometimes with explanation), or silent close; reopen if formal legal notice appears.

5) "Operational follow-ups before deciding"
   Signals: insufficient facts (timeline unclear; dispute vs refund; fraud vs authorized).
   Typical recommendation: verify facts first (e.g., confirm prior notice date, confirm no usage/logins, confirm fraud signals, confirm Stripe dispute state), then decide.

STYLE:
- Start with "Legal recommendation:" (matching existing decision format)
- Be concise — 1-3 sentences is ideal
- Reference the key factors driving your recommendation (amount, jurisdiction, threat level, timing, policy)
- When recommending a refund, specify conditions if applicable (e.g., "confirm members removed", "verify no Stripe dispute pending")
- When pushing back, explain why (e.g., "vague legal threat", "no specific disputed charge")
- Do NOT use legalese or formal language — write like a busy attorney giving quick internal guidance
- Do NOT include greetings or sign-offs

OUTPUT FORMAT (JSON):
{
  "recommendation": "Legal recommendation: ...",
  "pattern": "one of: refund_de_escalate | refund_seats | void_invoice | push_back | verify_facts",
  "reasoning": "one sentence explaining the key factor"
}

Return ONLY valid JSON. No markdown formatting, no code fences.`;

const EXAMPLES: { user: string; assistant: string }[] = [
  {
    user: `Complaint basis: Unaware of renewal
Scenario: Customer Alexander Anderson reported unexpected monthly charges (~$70 AUD) on his Westpac Mastercard for a Notion Business plan under an old account registered with a former legal name, "Alex Lester." He states he never created the account and that the charges are unauthorized.
Customer push back: On October 20, 2025, I formally notified Notion that my Westpac Mastercard was being charged in a way I didn't recognise.`,
    assistant: JSON.stringify({
      recommendation: `Legal recommendation: If this statement is accurate: "on October 20, 2025, I formally notified Notion that my Westpac Mastercard was being charged in a way I didn't recognise" recommend issuing the refund given the amount and to avoid escalation.`,
      pattern: "refund_de_escalate",
      reasoning: "User claims prior notification of unauthorized charges; amount is low and not worth escalation risk.",
    }),
  },
  {
    user: `Complaint basis: Accidental addition of members
Scenario: The user is requesting a refund for 2 accidental member additions. Their request has been declined multiple times. The charges and billing system have been explained, but the user insists that the billing is misleading. They have referenced their DPO and data protection rights.
Customer push back: I am formally requesting a refund under my rights as outlined by our Data Protection Officer.`,
    assistant: JSON.stringify({
      recommendation: `Legal recommendation: Ok to issue refund given the DPO reference and fact that they added the personal seat vs. additional individual and membership issue.`,
      pattern: "refund_seats",
      reasoning: "DPO reference elevates escalation risk; accidental seat add is a known confusion point.",
    }),
  },
  {
    user: `Complaint basis: Unaware of renewal
Scenario: The user wants a refund for the invoices created in November & December. I declined, but they mentioned reporting to the BBB if we don't give them a refund. The charges are related to member additions they claim they didn't authorize.
Customer push back: If this is not resolved I will be filing a complaint with the Better Business Bureau.`,
    assistant: JSON.stringify({
      recommendation: `Legal recommendation: Ok with issuing refund to avoid BBB complaint in this instance related to member add feature.`,
      pattern: "refund_de_escalate",
      reasoning: "BBB complaint threat with member-add confusion; easier to resolve than to defend.",
    }),
  },
  {
    user: `Complaint basis: (Yearly) Prorated refund due to early cancellation
Scenario: The customer believes they were systematically overcharged over multiple annual renewals because their workspace had more billed member seats than what they consider to be "active" users. They are requesting a full refund of all charges and threatening legal action.
Customer push back: I will be consulting with my attorney if this is not resolved immediately.`,
    assistant: JSON.stringify({
      recommendation: `Legal recommendation: close or push back and reopen if they submit a formal legal notice. (Vague legal threat)`,
      pattern: "push_back",
      reasoning: "Legal threat is vague with no specific claim; no formal notice filed.",
    }),
  },
  {
    user: `Complaint basis: Unaware of renewal
Scenario: The user is the verified cardholder of a paid workspace whose account email address they have lost access to. They are requesting a refund of their annual renewal. They state they will dispute the charge with their bank if not resolved.
Customer push back: If you are unable to process the refund for this charge, I will have no choice but to dispute the transaction directly with my bank.`,
    assistant: JSON.stringify({
      recommendation: `Legal recommendation: are we able to confirm no additional charges will be made against this card? If so we can start there since the user says "However, if you are unable to process the refund for this charge" — confirm card removal first, then assess refund eligibility.`,
      pattern: "verify_facts",
      reasoning: "Need to confirm card status and whether further charges are possible before deciding on refund.",
    }),
  },
];

export async function draftCxDecision(
  scenario: string,
  complaintBasis: string[],
  customerPushback: string
): Promise<CxDecisionResult> {
  const userMessage = [
    `Complaint basis: ${complaintBasis.join(", ") || "Not specified"}`,
    `Scenario: ${scenario}`,
    customerPushback ? `Customer push back: ${customerPushback}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const ex of EXAMPLES) {
    messages.push({ role: "user", content: ex.user });
    messages.push({ role: "assistant", content: ex.assistant });
  }
  messages.push({ role: "user", content: userMessage });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  let text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/, "");

  try {
    return JSON.parse(text) as CxDecisionResult;
  } catch {
    return {
      recommendation: text.slice(0, 500),
      pattern: "unknown",
      reasoning: "Failed to parse structured response",
    };
  }
}
