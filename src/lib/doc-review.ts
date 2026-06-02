import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ timeout: 120_000 });

export type RiskLevel = "High" | "Medium" | "Low" | "None";

export interface PillarAssessment {
  level: RiskLevel;
  summary: string;
  findings: string;
}

export interface DocReviewResult {
  documentType: string;
  completenessIssues: string[];
  pillars: {
    privacy: PillarAssessment;
    patent: PillarAssessment;
    subprocessor: PillarAssessment;
    dataGovernance: PillarAssessment;
    commercial: PillarAssessment;
  };
  summary: string;
  keyIssues: string[];
  escalation: string[];
  followUpConditions: string[];
}

const SYSTEM_PROMPT = `You are a legal review screening analyst for a Product & IP Legal team. You perform initial screening of documents to flag potential legal issues for human attorney review.

IMPORTANT LIMITATIONS:
- You flag potential issues but DO NOT assess severity
- You DO NOT make cleared or blocked determinations
- You DO NOT provide legal advice or interpretations
- Always defer final judgment to human attorneys

STYLE: Be concise and structured. Write for busy attorneys who scan reports.
- Executive summary: 2-3 sentences max.
- Pillar "summary": ONE sentence capturing the headline finding for that pillar.
- Pillar "findings": 1-2 short paragraphs. Use **bold** for key terms and structure with bullet points where helpful. Do NOT repeat what the summary already says.
- keyIssues: 3-5 items max. Each item is one sentence.
- completenessIssues: 3-5 items max. Only the most important gaps.
- escalation: List specific people mentioned in the document or implied by the risk area, with their role and what they should review. Format: "Name (Role) — what to review". If no specific people can be identified, suggest the relevant team/function.
- followUpConditions: 3-6 items max. Actionable conditions only.

OUTPUT SCHEMA:

{
  "documentType": "PRD | Design Doc | Tech Spec | Policy | Memo | Announcement | Other",
  "completenessIssues": ["max 5 most important gaps"],
  "pillars": {
    "privacy": { "level": "High|Medium|Low|None", "summary": "one sentence", "findings": "1-2 paragraphs" },
    "patent": { "level": "High|Medium|Low|None", "summary": "one sentence", "findings": "1-2 paragraphs" },
    "subprocessor": { "level": "High|Medium|Low|None", "summary": "one sentence", "findings": "1-2 paragraphs" },
    "dataGovernance": { "level": "High|Medium|Low|None", "summary": "one sentence", "findings": "1-2 paragraphs" },
    "commercial": { "level": "High|Medium|Low|None", "summary": "one sentence", "findings": "1-2 paragraphs" }
  },
  "summary": "2-3 sentence executive summary",
  "keyIssues": ["3-5 issues"],
  "escalation": ["Person (Role) — what to review"],
  "followUpConditions": ["3-6 actionable conditions"]
}

PILLAR INDICATORS:

PRIVACY: Personal data, PII, sensitive data, biometric, health info, cross-border transfers, GDPR/CCPA, new data collection, third-party sharing, AI processing of user data.
PATENT: Novel/innovative claims, new algorithms, unique architecture. URGENCY FLAG if public disclosure before patent filing.
SUBPROCESSOR: Third-party APIs, vendors, integrations. Extract vendor names and data flows.
DATA GOVERNANCE: Customer data usage, analytics, training data, "improve the product" language, permission models, admin controls, audit logging.
COMMERCIAL: Paid features, pricing tiers, deprecations, changes to paid features, monetization.

Return ONLY valid JSON. No markdown formatting, no code fences.`;

const EXAMPLE_ANNOUNCEMENT = {
  user: `## Document to Review: "Notion Mail Deprecation & Developer Platform Expansion"\nEPD-wide announcement: Notion Mail (web, desktop, iOS) shutting down in ~60 days. Mail team pivoting to Developer Platform. PMM communications plan in progress. Developer platform will enable developers to package, share, and monetize creations.`,
  assistant: JSON.stringify({
    documentType: "Announcement",
    completenessIssues: [
      "No data deletion/export plan for Notion Mail Customer Data mentioned",
      "No confirmation that enterprise contract obligations have been reviewed",
      "PMM communications plan not yet reviewed by Legal",
      "Developer platform monetization referenced but not yet specified"
    ],
    pillars: {
      privacy: { level: "Low", summary: "No new personal data collection. Shutdown reduces Notion's data surface.", findings: "The deprecation of Notion Mail reduces Notion's data collection footprint. No new personal data types or novel processing are introduced. Standard privacy considerations apply to the data deletion process (see Data Governance)." },
      patent: { level: "None", summary: "No novel technology described.", findings: "No novel technical architecture or patentable innovations are described. The Developer Platform expansion is referenced at a high level only; individual PRDs for new developer platform features should be screened separately." },
      subprocessor: { level: "None", summary: "No new third-party vendors introduced.", findings: "No new third-party vendors with Customer Data access are mentioned. Note: if mail-related subprocessors were in place for Notion Mail (e.g., email routing providers), their agreements should be reviewed and terminated as part of deprecation." },
      dataGovernance: { level: "Medium", summary: "Email data held in Notion Mail is Customer Data. Deletion, export, and portability obligations must be addressed before shutdown.", findings: "**Key concern:** Notion Mail stores Customer Data (emails, attachments, user-generated content). Upon deprecation:\n- What is the plan for **deleting Customer Data** from Mail infrastructure? Under the DPA/MSA, Notion must delete Customer Data following service termination.\n- Can customers **export** their Notion Mail data before shutdown? GDPR portability and contractual commitments require this.\n- Enterprise customers with BAAs may have HIPAA obligations regarding mail data disposal.\n\n**Recommendation:** Confirm a data deletion/export plan with the Privacy team before the deprecation date is announced externally." },
      commercial: { level: "High", summary: "Feature deprecation affects existing customers. Contractual notice, order form, SLA, and potential grandfathering obligations apply.", findings: "**Feature regression risk:** Notion Mail may be included in paid plans or referenced in order forms and enterprise contracts. Deprecating without proper notice or grandfathering could constitute a breach of contract.\n\n**Customer notification:** The 60-day deprecation timeline must satisfy the DPA/MSA's **30-day advance notice** requirement. Legal should confirm the planned PMM communications meet this obligation.\n\n**SLA implications:** If uptime SLAs reference Notion Mail, the deprecation may require contract amendments. Sales/CS should identify enterprise customers with explicit Notion Mail commitments." }
    },
    summary: "EPD announcement describes shutdown of Notion Mail within ~60 days and pivot of Mail team to Developer Platform. Primary legal risks: commercial (feature deprecation affecting customers on paid plans, contractual notice/SLA obligations) and data governance (disposition of Customer Data in Notion Mail, deletion/export obligations). Attorney review recommended before customer communications are finalized.",
    keyIssues: [
      "Feature deprecation within 60 days — potential breach for paid customers with Mail in order forms or SLAs",
      "No data deletion/export plan documented for Notion Mail Customer Data",
      "PMM communications plan should be reviewed by Legal before distribution",
      "Developer platform monetization will require separate legal review when PRDs are authored"
    ],
    escalation: [
      "Angela Koo (Mail/Passport legal owner) — primary reviewer for Mail deprecation, data governance, and commercial risk",
      "David Wang (Developer Platform legal owner) — loop in for Developer Platform expansion",
      "Matt Gantz / Patrick O'Callaghan (Privacy) — confirm data deletion/export plan for Mail Customer Data",
      "Bryan Ng / Josh Roberts (Monetization) — confirm whether Mail was separately priced or in order forms"
    ],
    followUpConditions: [
      "Review and approve customer-facing deprecation communications before distribution",
      "Confirm data deletion/export plan for Notion Mail Customer Data",
      "Assess order form and enterprise contract obligations referencing Notion Mail",
      "Confirm 30-day advance notice obligations to customers (per DPA/MSA)",
      "Verify SLA implications of feature removal"
    ]
  }),
};

const EXAMPLE_TECH_SPEC = {
  user: `## Document to Review: "User Profile Privacy"\nTech spec closing confirmed security vulnerability (TOB-NOTION-14) where any client could fetch any user's email address via syncRecordValues with no authorization check. Adds server-side permission gate that scrubs email field from notion_user rows when caller has no legitimate relationship. Introduces canSeeUserProfile(viewer, target, context) resolver. Adds spacePointer parameter for context threading. Audit log: userProfileAccessDenied events to Honeycomb. Controlled via two Statsig feature gates with phased rollout.`,
  assistant: JSON.stringify({
    documentType: "Tech Spec",
    completenessIssues: [
      "No DPIA analysis for global user profile processing change",
      "No privacy policy impact assessment",
      "No data retention policy defined for new audit logs",
      "No data flow diagram for the permission gate"
    ],
    pillars: {
      privacy: { level: "High", summary: "Directly addresses unauthorized access to user email addresses (PII) — new permission model needs GDPR review.", findings: "Vulnerability (TOB-NOTION-14) allowed **bulk scraping of emails** without authentication. Fix changes how personal data is protected at the API layer globally. Key questions for attorney:\n- Does **canSeeUserProfile** satisfy GDPR data minimization and access control requirements?\n- Is a **DPIA** required given this change applies to all user profile reads globally?\n- Does excluding anonymous denies from the audit log create any compliance gap?\n- Does this require a Privacy Policy or DPA update?" },
      patent: { level: "None", summary: "Standard permission-gating pattern. No novel algorithm or unique technical approach.", findings: "Standard permission-gating pattern. No novel algorithm or unique technical approach identified. No public disclosure urgency." },
      subprocessor: { level: "None", summary: "Pure internal server-side change. No new third-party vendors.", findings: "Pure internal server-side change. No new third-party vendors or external services involved." },
      dataGovernance: { level: "Medium", summary: "Redefines access rules for notion_user records across all API callers. New audit logging scope needs review.", findings: "**New governance boundary:** canSeeUserProfile resolver redefines access rules for notion_user email across all API callers.\n- **Audit logging** (userProfileAccessDenied) is new — scope and retention should be confirmed\n- Anonymous denies intentionally excluded from audit log (high-volume); adequacy should be reviewed\n- No data retention policy defined for audit logs" },
      commercial: { level: "Low", summary: "Security fix with no pricing or packaging changes.", findings: "Security fix with no pricing or packaging changes. Potential UI regressions assessed and deemed non-issues in the doc (email not displayed in affected surfaces)." }
    },
    summary: "This tech spec closes a confirmed security vulnerability (TOB-NOTION-14) where any client could fetch any user's email address via syncRecordValues with no authorization check. The fix adds a server-side permission gate that scrubs the email field for unauthorized callers. Primary legal concerns: high privacy risk (new PII access model needs GDPR review, DPIA assessment) and data governance (new audit logging scope and retention policy undefined).",
    keyIssues: [
      "canSeeUserProfile permission model needs GDPR data minimization and access control review",
      "DPIA may be required given global scope of user profile processing change",
      "Anonymous deny exclusion from audit log — compliance adequacy question",
      "No privacy policy or DPA update assessment documented"
    ],
    escalation: [
      "Angela Koo (assigned attorney) — primary reviewer for privacy and data governance",
      "Privacy team — DPIA assessment and privacy policy impact review",
      "Security team — confirm vulnerability remediation is complete"
    ],
    followUpConditions: [
      "Confirm canSeeUserProfile permission model satisfies GDPR data minimization and access control requirements",
      "Assess whether DPIA is required given scale of user profile processing change (global)",
      "Review adequacy of audit log scope (anonymous denies excluded)",
      "Confirm whether Privacy Policy or DPA updates are needed",
      "Assess data retention requirements for new userProfileAccessDenied audit logs"
    ]
  }),
};

const EXAMPLE_PRD = {
  user: `## Document to Review: "Permission Group Owner"\nPRD introduces permission group ownership delegation for Business & Enterprise plan customers, enabling non-admin group members to manage group membership and settings without IT intervention. New admin controls for group creation policies. SCIM group synced badges. Audit logging for ownership events. Public Replit prototype linked: https://group-manager-viswa046.replit.app/groups. Groups as Teams architecture with nested groups. PM: Viswa.`,
  assistant: JSON.stringify({
    documentType: "PRD",
    completenessIssues: [
      "No data flow diagrams for permission model changes",
      "Success metrics incomplete — placeholder links only, no defined targets",
      "Multiple placeholder links in Recommended Solution and GTM sections"
    ],
    pillars: {
      privacy: { level: "Low", summary: "No new personal data collection; audit logging added; standard permission management changes.", findings: "No new personal data types being collected. Feature manages who can administer group membership — not a data collection change. Audit logging is being introduced for group ownership events (positive control). No cross-border data flows or AI processing identified." },
      patent: { level: "Medium", summary: "Public Replit prototype may constitute prior art disclosure — assess urgency for invention disclosure.", findings: "A **public Replit prototype** was linked in the PRD: https://group-manager-viswa046.replit.app/groups. This constitutes a publicly accessible demo and may affect patent filing timelines.\n\nThe \"Groups as Teams\" architecture (ownership delegation, group policies, nested groups) integrated with People primitive and database row permissions may contain patentable elements.\n\n**Recommendation:** Schedule invention disclosure session within 30 days; assess whether the Replit prototype escalates to HIGH urgency (file provisional within 1-2 weeks)." },
      subprocessor: { level: "None", summary: "No new third-party vendors. SCIM integration is existing.", findings: "No new third-party vendors identified. SCIM integration is an existing subprocessor pattern. No new vendor due diligence required." },
      dataGovernance: { level: "Medium", summary: "Permission delegation model changes who can control access to content and potentially Customer Data.", findings: "**Permission delegation expansion:** Group owners (non-admins) can now add/remove members, rename groups, and delete groups — affecting who has access to teamspaces and pages.\n- Admin override rights are preserved per PRD (Org/Workspace Owners and Membership Admins retain all controls)\n- Key question: can a newly assigned group owner inadvertently grant themselves or others access to **Customer Data** they shouldn't have?\n- Audit logging for group ownership events is planned — confirms governance controls in place" },
      commercial: { level: "Low", summary: "Feature is Business & Enterprise only; existing workspace defaults preserved; no feature regression.", findings: "Feature is gated to **Business & Enterprise plans** — no impact to free/plus customers. Existing workspace defaults are preserved (Admins-only group creation default maintained for existing workspaces). No existing paid functionality is being reduced or removed." }
    },
    summary: "PRD introduces permission group ownership delegation for Business & Enterprise plan customers, enabling non-admin group members to manage their own groups without IT intervention. Primary concerns: patent risk from a publicly accessible Replit prototype (assess invention disclosure urgency) and data governance around the expanded permission delegation model (verify no unintended Customer Data exposure).",
    keyIssues: [
      "Public Replit prototype may constitute prior art disclosure — assess patent filing urgency",
      "Permission delegation model could allow unintended Customer Data access — verify in implementation",
      "No data flow diagrams for permission model changes",
      "Success metrics undefined — placeholder links only"
    ],
    escalation: [
      "Angela Koo (assigned attorney) — primary reviewer for data governance and patent risk",
      "Head of Product & IP Legal — patent urgency assessment for Replit prototype disclosure",
      "Viswa (PM) — confirm Replit prototype access controls and public availability"
    ],
    followUpConditions: [
      "Assess patent urgency given public Replit prototype — determine if invention disclosure should be within 2 weeks (HIGH) vs. 30 days (MEDIUM)",
      "Confirm no Customer Data is exposed to newly-elevated group owners beyond previous access",
      "Request completed data flow diagrams and tech spec for permission delegation architecture",
      "Verify audit logging covers all new group ownership events",
      "Confirm Business & Enterprise plan gating is enforced at the API/backend level"
    ]
  }),
};

export async function analyzeDocument(
  docContent: string,
  docTitle: string,
  playbook: string
): Promise<DocReviewResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: EXAMPLE_ANNOUNCEMENT.user },
      { role: "assistant", content: EXAMPLE_ANNOUNCEMENT.assistant },
      { role: "user", content: EXAMPLE_TECH_SPEC.user },
      { role: "assistant", content: EXAMPLE_TECH_SPEC.assistant },
      { role: "user", content: EXAMPLE_PRD.user },
      { role: "assistant", content: EXAMPLE_PRD.assistant },
      {
        role: "user",
        content: `## Legal Review Playbook\n${playbook}\n\n## Document to Review: "${docTitle}"\n${docContent}`,
      },
    ],
  });

  let text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/,"");

  try {
    const parsed = JSON.parse(text) as DocReviewResult;
    const defaultPillar: PillarAssessment = { level: "None", summary: "Not assessed", findings: "Not assessed" };
    parsed.pillars = {
      privacy: parsed.pillars?.privacy ?? defaultPillar,
      patent: parsed.pillars?.patent ?? defaultPillar,
      subprocessor: parsed.pillars?.subprocessor ?? defaultPillar,
      dataGovernance: parsed.pillars?.dataGovernance ?? defaultPillar,
      commercial: parsed.pillars?.commercial ?? defaultPillar,
    };
    parsed.escalation = parsed.escalation ?? [];
    return parsed;
  } catch {
    return {
      documentType: "Unknown",
      completenessIssues: ["Failed to parse structured analysis"],
      pillars: {
        privacy: { level: "None", summary: "Analysis unavailable", findings: "Analysis unavailable" },
        patent: { level: "None", summary: "Analysis unavailable", findings: "Analysis unavailable" },
        subprocessor: { level: "None", summary: "Analysis unavailable", findings: "Analysis unavailable" },
        dataGovernance: { level: "None", summary: "Analysis unavailable", findings: "Analysis unavailable" },
        commercial: { level: "None", summary: "Analysis unavailable", findings: "Analysis unavailable" },
      },
      summary: text.slice(0, 500),
      keyIssues: [],
      escalation: [],
      followUpConditions: [],
    };
  }
}
