const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Robust hash-based vectorizer matching src/lib/ai/embedding.ts
function generateHashEmbedding(text, dimensions = 384) {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  if (words.length === 0) return vector;
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < 3; i++) {
      const index = Math.abs((hash + i * 123456789)) % dimensions;
      vector[index] += 1;
    }
  }
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }
  return vector;
}

const pool = new Pool({ connectionString: 'postgresql://postgres@127.0.0.1:5433/legalqa?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const seedDocuments = [
  // --- CONTRACT TEMPLATES ---
  {
    title: 'Mutual Non-Disclosure Agreement (MNDA)',
    category: 'Contract Templates',
    collection: 'Corporate',
    tags: ['nda', 'confidentiality', 'mutual', 'ip'],
    author: 'Legal Operations',
    version: 'v4.1',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: ['Dispute Escalation Window'],
    complianceCoverage: 98,
    clauseCount: 12,
    readingTime: '5 min',
    relatedDocs: ['One-Way Non-Disclosure Agreement', 'Master Services Agreement (MSA)', 'Data Processing Agreement (DPA)'],
    versionHistory: [
      { version: 'v4.1', date: '15 Jul 2026', author: 'Legal Operations', changes: 'Updated definitions to cover Generative AI outputs and prompt engineering data.', status: 'APPROVED' },
      { version: 'v4.0', date: '10 Jan 2026', author: 'Sarah Jenkins', changes: 'Standard annual legal update.', status: 'APPROVED' }
    ],
    summary: 'Standard bilateral confidentiality agreement for commercial discussions, protecting technical IP, financial data, and trade secrets with standard 3-year survival.',
    body: `# MUTUAL NON-DISCLOSURE AGREEMENT (MNDA)

## SECTION 1. DEFINITIONS & CONFIDENTIAL INFORMATION
1.1 "Confidential Information" means all non-public, proprietary, or confidential information disclosed by either party ("Disclosing Party") to the other party ("Receiving Party"), whether orally, visually, or in writing.
1.2 Exclusions: Confidential Information does not include information that: (a) is or becomes publicly available without breach of this Agreement; (b) was rightfully known prior to disclosure; (c) is independently developed without reference to Disclosing Party's data.

## SECTION 2. OBLIGATIONS & RESTRICTIONS
2.1 Duty of Care: Receiving Party agrees to hold all Confidential Information in strict confidence using at least a reasonable degree of care.
2.2 Non-Use: Receiving Party shall use Confidential Information solely for evaluating potential business collaboration.

## SECTION 3. TERM & SURVIVAL
3.1 The term of this Agreement is three (3) years from the Effective Date. The confidentiality obligations herein shall survive termination for five (5) years.`
  },

  {
    title: 'One-Way Non-Disclosure Agreement',
    category: 'Contract Templates',
    collection: 'Commercial',
    tags: ['nda', 'unilateral', 'confidentiality'],
    author: 'Commercial Legal',
    version: 'v2.3',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 10,
    readingTime: '4 min',
    relatedDocs: ['Mutual Non-Disclosure Agreement (MNDA)', 'Vendor Master Agreement'],
    versionHistory: [
      { version: 'v2.3', date: '01 Mar 2026', author: 'Commercial Legal', changes: 'Revised unilateral disclosure clauses for vendor demos.', status: 'APPROVED' }
    ],
    summary: 'Unilateral non-disclosure agreement for single-direction disclosures during vendor evaluations and recruitment interviews.',
    body: `# ONE-WAY NON-DISCLOSURE AGREEMENT

## SECTION 1. RECITALS & PURPOSE
1.1 Disclosing Party intends to share proprietary operational data and technical specifications with Receiving Party for evaluation.

## SECTION 2. CONFIDENTIALITY UNDERTAKINGS
2.1 Receiving Party shall not copy, reproduce, or reverse-engineer any Disclosing Party assets without express written consent.`
  },

  {
    title: 'Master Services Agreement (MSA)',
    category: 'Contract Templates',
    collection: 'Commercial',
    tags: ['msa', 'services', 'master-agreement', 'liability'],
    author: 'Senior Counsel',
    version: 'v5.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: ['Cyber Insurance Cap'],
    complianceCoverage: 92,
    clauseCount: 22,
    readingTime: '12 min',
    relatedDocs: ['Service Level Agreement (SLA) Addendum', 'Statement of Work (SOW)', 'Software Development Agreement'],
    versionHistory: [
      { version: 'v5.0', date: '20 May 2026', author: 'Senior Counsel', changes: 'Standardized 12-month trailing fee liability cap.', status: 'APPROVED' }
    ],
    summary: 'Comprehensive Master Services Agreement governing consulting, software development, and enterprise deliverables with 1x trailing fee liability cap.',
    body: `# MASTER SERVICES AGREEMENT (MSA)

## SECTION 1. SERVICES & STATEMENTS OF WORK
1.1 Provider shall perform services specified in executed Statements of Work ("SOW"). Each SOW incorporates this MSA.

## SECTION 2. PAYMENT TERMS & INVOICING
2.1 Fees are due net 30 days from invoice date. Late payments accrue interest at 1.5% per month.

## SECTION 3. LIMITATION OF LIABILITY
3.1 NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
3.2 AGGREGATE LIABILITY IS LIMITED TO FEES PAID IN THE PRIOR 12 MONTHS.`
  },

  {
    title: 'SaaS Enterprise Subscription Agreement',
    category: 'Contract Templates',
    collection: 'Technology',
    tags: ['saas', 'cloud', 'subscription', 'sla'],
    author: 'Tech Counsel',
    version: 'v3.8',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: ['Dedicated Tenant Provision'],
    complianceCoverage: 94,
    clauseCount: 18,
    readingTime: '10 min',
    relatedDocs: ['Service Level Agreement (SLA) Addendum', 'Data Processing Agreement (DPA)'],
    versionHistory: [
      { version: 'v3.8', date: '12 Jun 2026', author: 'Tech Counsel', changes: 'Added SOC 2 Type II compliance warranty.', status: 'APPROVED' }
    ],
    summary: 'Enterprise cloud software subscription agreement specifying user seat allocation, data residency, 99.9% uptime target, and renewal terms.',
    body: `# SAAS ENTERPRISE SUBSCRIPTION AGREEMENT

## SECTION 1. SUBSCRIPTION GRANT & ACCESS
1.1 Customer is granted a non-exclusive, non-transferable right to access the cloud software platform during the Subscription Term.

## SECTION 2. DATA PROTECTION & RESIDENCY
2.1 Provider warrants that Customer Data is encrypted in transit (TLS 1.3) and at rest (AES-256) in single-tenant isolated database environments.`
  },

  {
    title: 'Software Development Agreement',
    category: 'Contract Templates',
    collection: 'Technology',
    tags: ['software', 'development', 'ip-assignment', 'milestones'],
    author: 'Legal Team',
    version: 'v3.2',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: ['Dispute Escalation Committee', 'Cyber Liability Policy'],
    complianceCoverage: 95,
    clauseCount: 16,
    readingTime: '8 min',
    relatedDocs: ['Master Services Agreement (MSA)', 'Software Technology Licensing Agreement'],
    versionHistory: [
      { version: 'v3.2', date: '15 Jul 2026', author: 'Sarah Jenkins', changes: 'Updated GDPR liability cap and IP assignment terms.', status: 'APPROVED' }
    ],
    summary: 'Standard Software Development Agreement defining IP assignment upon payment, milestone acceptance criteria, testing windows, and 90-day warranty.',
    body: `# SOFTWARE DEVELOPMENT AGREEMENT

## SECTION 1. SCOPE & DELIVERABLES
1.1 Developer shall build, test, and deliver custom software in accordance with Milestone Schedule A.

## SECTION 2. INTELLECTUAL PROPERTY ASSIGNMENT
2.1 Upon receipt of full payment, Developer irrevocably assigns to Client all right, title, and interest in and to the custom source code and deliverables.

## SECTION 3. WARRANTY & BUG FIXES
3.1 Developer warrants that for ninety (90) days post-acceptance, deliverables will operate materially in conformity with specifications.`
  },

  {
    title: 'Executive Employment Agreement',
    category: 'Contract Templates',
    collection: 'Employment',
    tags: ['employment', 'executive', 'non-compete', 'equity'],
    author: 'HR Legal',
    version: 'v2.1',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: ['Severance Tax Gross-Up'],
    complianceCoverage: 91,
    clauseCount: 15,
    readingTime: '9 min',
    relatedDocs: ['Internship Agreement', 'Employee Code of Conduct'],
    versionHistory: [
      { version: 'v2.1', date: '10 Apr 2026', author: 'HR Legal', changes: 'Aligned non-solicitation radius with latest employment case law.', status: 'APPROVED' }
    ],
    summary: 'Executive employment contract detailing base compensation, equity vesting cliffs, non-solicitation covenants, and severance payout terms.',
    body: `# EXECUTIVE EMPLOYMENT AGREEMENT

## SECTION 1. POSITION & DUTIES
1.1 Executive shall serve in the role specified, reporting directly to the Board of Directors or CEO.

## SECTION 2. NON-SOLICITATION & NON-COMPETE
2.1 Executive agrees that during employment and for twelve (12) months thereafter, Executive shall not solicit company employees or clients.`
  },

  {
    title: 'Internship Agreement',
    category: 'Contract Templates',
    collection: 'Employment',
    tags: ['internship', 'employment', 'ip-release'],
    author: 'People Ops',
    version: 'v1.4',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 8,
    readingTime: '3 min',
    relatedDocs: ['Executive Employment Agreement'],
    versionHistory: [
      { version: 'v1.4', date: '01 Jan 2026', author: 'People Ops', changes: 'Standard annual internship update.', status: 'APPROVED' }
    ],
    summary: 'Short-form educational internship contract covering work product IP assignment and confidentiality obligations.',
    body: `# INTERNSHIP AGREEMENT

## SECTION 1. SCOPE OF INTERNSHIP
1.1 Intern will participate in an educational internship program under direct mentorship.`
  },

  {
    title: 'Consulting Services Agreement',
    category: 'Contract Templates',
    collection: 'Commercial',
    tags: ['consulting', 'independent-contractor', 'sow'],
    author: 'Procurement Legal',
    version: 'v3.0',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 11,
    readingTime: '5 min',
    relatedDocs: ['Master Services Agreement (MSA)', 'Vendor Master Agreement'],
    versionHistory: [
      { version: 'v3.0', date: '14 Feb 2026', author: 'Procurement Legal', changes: 'Clarified 1099 independent contractor status.', status: 'APPROVED' }
    ],
    summary: 'Independent contractor agreement specifying hourly fees, deliverables schedule, work-for-hire provisions, and 14-day termination notice.',
    body: `# CONSULTING SERVICES AGREEMENT

## SECTION 1. INDEPENDENT CONTRACTOR STATUS
1.1 Consultant is an independent contractor. Neither party is an agent or employee of the other.`
  },

  {
    title: 'Vendor Master Purchase Agreement',
    category: 'Contract Templates',
    collection: 'Procurement',
    tags: ['vendor', 'procurement', 'supply-chain'],
    author: 'Procurement Team',
    version: 'v4.2',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: ['ESG Sustainability Clause'],
    complianceCoverage: 93,
    clauseCount: 20,
    readingTime: '11 min',
    relatedDocs: ['Vendor Security Risk Policy', 'Vendor Onboarding & Risk Due Diligence SOP'],
    versionHistory: [
      { version: 'v4.2', date: '18 May 2026', author: 'Procurement Team', changes: 'Added mandatory SOC 2 audit requirement.', status: 'APPROVED' }
    ],
    summary: 'Master procurement agreement for software licenses, physical goods, and IT maintenance services with SLA penalties.',
    body: `# VENDOR MASTER PURCHASE AGREEMENT

## SECTION 1. VENDOR AUDIT & COMPLIANCE
1.1 Vendor warrants full compliance with anti-bribery laws, environmental safety, and corporate security guidelines.`
  },

  {
    title: 'Equipment Purchase Agreement',
    category: 'Contract Templates',
    collection: 'Finance',
    tags: ['purchase', 'hardware', 'warranty', 'shipping'],
    author: 'Finance Legal',
    version: 'v1.9',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 12,
    readingTime: '6 min',
    relatedDocs: ['Vendor Master Purchase Agreement'],
    versionHistory: [
      { version: 'v1.9', date: '22 Jan 2026', author: 'Finance Legal', changes: 'Updated shipping FOB destination rules.', status: 'APPROVED' }
    ],
    summary: 'Hardware procurement contract detailing delivery terms (FOB Destination), title transfer, express 3-year warranty, and return procedures.',
    body: `# EQUIPMENT PURCHASE AGREEMENT

## SECTION 1. DELIVERY & TITLE
1.1 Risk of loss and title transfer upon physical delivery to Client facility.`
  },

  {
    title: 'Data Processing Agreement (DPA)',
    category: 'Contract Templates',
    collection: 'Privacy',
    tags: ['dpa', 'gdpr', 'dpdp', 'privacy', 'scc'],
    author: 'Privacy Office',
    version: 'v4.0',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: ['Sub-processor Pre-approval'],
    complianceCoverage: 99,
    clauseCount: 19,
    readingTime: '14 min',
    relatedDocs: ['Global Data Privacy Policy', 'GDPR Compliance Checklist & Operational Manual'],
    versionHistory: [
      { version: 'v4.0', date: '10 Jun 2026', author: 'Privacy Office', changes: 'Integrated EU Standard Contractual Clauses (SCCs) and India DPDP 2023 Rules.', status: 'APPROVED' }
    ],
    summary: 'GDPR Article 28 and DPDP Act 2023 compliant Data Processing Addendum governing cross-border transfers, sub-processor consent, and 24-hour breach notification.',
    body: `# DATA PROCESSING AGREEMENT (DPA)

## SECTION 1. CONTROLLER & PROCESSOR ROLES
1.1 Client is Data Controller; Vendor is Data Processor. Vendor shall process Personal Data solely on documented instructions.

## SECTION 2. SECURITY & BREACH NOTIFICATION
2.1 Processor shall notify Controller without undue delay and in any event within 24 hours of becoming aware of a Personal Data Breach.`
  },

  {
    title: 'Strategic Partnership Agreement',
    category: 'Contract Templates',
    collection: 'Corporate',
    tags: ['partnership', 'joint-venture', 'co-marketing'],
    author: 'Corporate Strategy',
    version: 'v2.0',
    status: 'PENDING_REVIEW',
    riskLevel: 'MEDIUM',
    missingClauses: ['Exclusivity Carve-outs'],
    complianceCoverage: 88,
    clauseCount: 14,
    readingTime: '8 min',
    relatedDocs: ['Master Services Agreement (MSA)'],
    versionHistory: [
      { version: 'v2.0', date: '25 Jul 2026', author: 'Corporate Strategy', changes: 'Draft updated for 2026 Q3 co-marketing initiative.', status: 'PENDING_REVIEW' }
    ],
    summary: 'Bilateral partnership contract establishing revenue sharing ratios, joint marketing budgets, and mutual IP cross-licensing.',
    body: `# STRATEGIC PARTNERSHIP AGREEMENT

## SECTION 1. JOINT GO-TO-MARKET INITIATIVE
1.1 Parties agree to co-market integrated solutions under joint branding guidelines.`
  },

  {
    title: 'Software Technology Licensing Agreement',
    category: 'Contract Templates',
    collection: 'IP',
    tags: ['licensing', 'software', 'royalties', 'patent'],
    author: 'IP Counsel',
    version: 'v3.5',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: ['Patent Infringement Carve-out'],
    complianceCoverage: 94,
    clauseCount: 17,
    readingTime: '11 min',
    relatedDocs: ['Software Development Agreement', 'Intellectual Property Pre-Filing Review SOP'],
    versionHistory: [
      { version: 'v3.5', date: '11 Feb 2026', author: 'IP Counsel', changes: 'Refined field-of-use restrictions.', status: 'APPROVED' }
    ],
    summary: 'Non-exclusive perpetual software license agreement restricting reverse engineering, specifying annual royalty audits, and patent indemnification.',
    body: `# SOFTWARE TECHNOLOGY LICENSING AGREEMENT

## SECTION 1. LICENSE GRANT & RESTRICTIONS
1.1 Licensor grants Licensee a non-exclusive, worldwide, non-transferable license to execute the Software.`
  },

  {
    title: 'Service Level Agreement (SLA) Addendum',
    category: 'Contract Templates',
    collection: 'Technology',
    tags: ['sla', 'uptime', 'support', 'credits'],
    author: 'DevOps Legal',
    version: 'v2.8',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 10,
    readingTime: '5 min',
    relatedDocs: ['SaaS Enterprise Subscription Agreement', 'Maintenance & Support Agreement'],
    versionHistory: [
      { version: 'v2.8', date: '04 May 2026', author: 'DevOps Legal', changes: 'Added P1 15-minute response SLA.', status: 'APPROVED' }
    ],
    summary: 'Service Level Agreement defining 99.9% uptime target, maintenance notification windows, P1-P4 escalation matrix, and service credit formulas.',
    body: `# SERVICE LEVEL AGREEMENT (SLA) ADDENDUM

## SECTION 1. SERVICE AVAILABILITY COMMITMENT
1.1 Target Uptime: 99.9% calculated monthly excluding scheduled maintenance.`
  },

  {
    title: 'Maintenance & Support Agreement',
    category: 'Contract Templates',
    collection: 'Technology',
    tags: ['maintenance', 'support', 'patches', 'upgrades'],
    author: 'Tech Counsel',
    version: 'v1.5',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 96,
    clauseCount: 9,
    readingTime: '4 min',
    relatedDocs: ['Service Level Agreement (SLA) Addendum'],
    versionHistory: [
      { version: 'v1.5', date: '08 Jan 2026', author: 'Tech Counsel', changes: 'Updated version upgrade eligibility rules.', status: 'APPROVED' }
    ],
    summary: 'Annual software support agreement detailing security patch deployment schedules, major version upgrade rights, and 24/7 helpdesk access.',
    body: `# MAINTENANCE & SUPPORT AGREEMENT

## SECTION 1. SUPPORT TIER ELIGIBILITY
1.1 Customer receives 24/7 critical ticketing and quarterly minor updates.`
  },

  // --- COMPANY POLICIES ---
  {
    title: 'Global Data Privacy Policy',
    category: 'Company Policies',
    collection: 'Privacy',
    tags: ['privacy', 'gdpr', 'dpdp', 'data-protection'],
    author: 'Data Protection Officer',
    version: 'v4.5',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: ['Children Data Special Consent'],
    complianceCoverage: 96,
    clauseCount: 24,
    readingTime: '15 min',
    relatedDocs: ['Data Processing Agreement (DPA)', 'GDPR Compliance Checklist & Operational Manual'],
    versionHistory: [
      { version: 'v4.5', date: '01 Jul 2026', author: 'DPO', changes: 'Integrated India DPDP 2023 Rules and updated DSAR processing timelines to 30 days.', status: 'APPROVED' }
    ],
    summary: 'Corporate privacy policy establishing baseline practices for user data collection, lawful bases for processing, data subject rights (DSAR), and cross-border transfers.',
    body: `# GLOBAL DATA PRIVACY POLICY

## SECTION 1. SCOPE & PURPOSE
1.1 This Policy applies to all employees, contractors, and processors handling Personal Data across global operations.

## SECTION 2. DATA PRINCIPLES
2.1 Purpose Limitation: Data must be collected for specified, explicit, and legitimate purposes.
2.2 Data Minimization: Processing is strictly limited to necessary operational requirements.

## SECTION 3. DATA SUBJECT RIGHTS
3.1 Right to Access, Rectify, Erasure (Right to be Forgotten), and Portability.`
  },

  {
    title: 'Information Security Policy (ISP)',
    category: 'Company Policies',
    collection: 'Technology',
    tags: ['infosec', 'security', 'iso27001', 'passwords'],
    author: 'CISO',
    version: 'v5.1',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 30,
    readingTime: '18 min',
    relatedDocs: ['Enterprise Cybersecurity Policy', 'ISO 27001 Annex A Control Guidance'],
    versionHistory: [
      { version: 'v5.1', date: '10 Feb 2026', author: 'CISO', changes: 'Mandated hardware YubiKey MFA for production environment access.', status: 'APPROVED' }
    ],
    summary: 'Mandatory information security policy defining password complexity, multi-factor authentication (MFA), network segmentation, encryption at rest, and audit logging.',
    body: `# INFORMATION SECURITY POLICY (ISP)

## SECTION 1. ACCESS CONTROL & IDENTIFICATION
1.1 All personnel must use unique credentials with mandatory MFA. Shared accounts are strictly prohibited.`
  },

  {
    title: 'Acceptable Use Policy (AUP)',
    category: 'Company Policies',
    collection: 'Corporate',
    tags: ['acceptable-use', 'it-policy', 'network'],
    author: 'IT Operations',
    version: 'v3.0',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 14,
    readingTime: '6 min',
    relatedDocs: ['BYOD (Bring Your Own Device) Policy', 'Information Security Policy (ISP)'],
    versionHistory: [
      { version: 'v3.0', date: '05 Jan 2026', author: 'IT Operations', changes: 'Added cloud storage upload restriction rules.', status: 'APPROVED' }
    ],
    summary: 'Employee IT guidelines governing corporate laptop usage, forbidden software installations, network bandwidth monitoring, and social media etiquette.',
    body: `# ACCEPTABLE USE POLICY (AUP)

## SECTION 1. PERMITTED HARDWARE & SOFTWARE USAGE
1.1 Corporate devices must be used strictly for business purposes. Unauthorized software installation is prohibited.`
  },

  {
    title: 'Global Code of Business Conduct & Ethics',
    category: 'Company Policies',
    collection: 'Corporate',
    tags: ['ethics', 'code-of-conduct', 'anti-bribery', 'whistleblower'],
    author: 'Compliance Director',
    version: 'v2.4',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 22,
    readingTime: '12 min',
    relatedDocs: ['Vendor Security Risk Policy'],
    versionHistory: [
      { version: 'v2.4', date: '12 May 2026', author: 'Compliance Director', changes: 'Updated FCPA anti-bribery gift limits to $100 maximum.', status: 'APPROVED' }
    ],
    summary: 'Ethical governance framework covering anti-corruption (FCPA), conflict of interest disclosures, gift thresholds ($100 max), and anonymous whistleblower hotline.',
    body: `# GLOBAL CODE OF BUSINESS CONDUCT & ETHICS

## SECTION 1. ANTI-BRIBERY & CORRUPTION
1.1 Zero tolerance for bribes, kickbacks, or facilitation payments to government officials.`
  },

  {
    title: 'Remote Work & Telecommuting Policy',
    category: 'Company Policies',
    collection: 'Employment',
    tags: ['remote-work', 'hr', 'telework', 'vpn'],
    author: 'People Team',
    version: 'v2.0',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 95,
    clauseCount: 12,
    readingTime: '5 min',
    relatedDocs: ['Executive Employment Agreement', 'BYOD (Bring Your Own Device) Policy'],
    versionHistory: [
      { version: 'v2.0', date: '15 Mar 2026', author: 'People Team', changes: 'Set maximum 30 days per year international remote work limit.', status: 'APPROVED' }
    ],
    summary: 'Policy governing remote work eligibility, home ergonomics allowances, mandatory VPN usage on public Wi-Fi, and international working day caps.',
    body: `# REMOTE WORK & TELECOMMUTING POLICY

## SECTION 1. SECURITY & NETWORK AT HOME
1.1 Remote employees must connect to corporate infrastructure via encrypted VPN at all times.`
  },

  {
    title: 'Enterprise Cybersecurity & Zero Trust Policy',
    category: 'Company Policies',
    collection: 'Technology',
    tags: ['cybersecurity', 'malware', 'zero-trust', 'firewall'],
    author: 'Security Ops',
    version: 'v3.9',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 99,
    clauseCount: 26,
    readingTime: '14 min',
    relatedDocs: ['Information Security Policy (ISP)', 'Cybersecurity Incident Response SOP'],
    versionHistory: [
      { version: 'v3.9', date: '02 Jun 2026', author: 'Security Ops', changes: 'Mandated 14-day critical patch deployment window.', status: 'APPROVED' }
    ],
    summary: 'Zero-Trust network architecture policy requiring continuous identity verification, EDR agent installation on all endpoints, and 14-day patch SLA.',
    body: `# ENTERPRISE CYBERSECURITY & ZERO TRUST POLICY

## SECTION 1. ZERO TRUST ARCHITECTURE
1.1 Never Trust, Always Verify: Access requests are authenticated, authorized, and encrypted before granting access.`
  },

  {
    title: 'Corporate AI Usage & Generative AI Policy',
    category: 'Company Policies',
    collection: 'Technology',
    tags: ['ai', 'generative-ai', 'llm', 'chatgpt', 'ip-risk'],
    author: 'AI Ethics Board',
    version: 'v1.2',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: ['Algorithmic Audit Schedule'],
    complianceCoverage: 92,
    clauseCount: 16,
    readingTime: '8 min',
    relatedDocs: ['AI Vendor Assessment Playbook', 'SEBI AI & ML Governance Framework Notes'],
    versionHistory: [
      { version: 'v1.2', date: '19 Jul 2026', author: 'AI Ethics Board', changes: 'Explicitly prohibited feeding unvetted client PII or source code into public LLMs.', status: 'APPROVED' }
    ],
    summary: 'Corporate policy regulating employee usage of LLMs and Generative AI tools, prohibiting input of proprietary source code or customer PII into public models.',
    body: `# CORPORATE AI USAGE & GENERATIVE AI POLICY

## SECTION 1. PERMISSIBLE & PROHIBITED USES
1.1 Employees SHALL NOT input proprietary code, unreleased financials, or client PII into public AI models (e.g. ChatGPT free tier).`
  },

  {
    title: 'BYOD (Bring Your Own Device) Policy',
    category: 'Company Policies',
    collection: 'Technology',
    tags: ['byod', 'mobile', 'mdm', 'security'],
    author: 'IT Security',
    version: 'v2.2',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 94,
    clauseCount: 11,
    readingTime: '5 min',
    relatedDocs: ['Acceptable Use Policy (AUP)'],
    versionHistory: [
      { version: 'v2.2', date: '18 Feb 2026', author: 'IT Security', changes: 'Added containerized workspace wipe provisions.', status: 'APPROVED' }
    ],
    summary: 'Security rules for personal mobile phones and laptops accessing corporate email, mandating MDM enrollment and remote corporate container wipe capability.',
    body: `# BYOD (BRING YOUR OWN DEVICE) POLICY

## SECTION 1. MDM ENROLLMENT
1.1 Personal devices must enroll in Corporate MDM to segment business data from personal apps.`
  },

  {
    title: 'Third-Party Vendor Security Risk Policy',
    category: 'Company Policies',
    collection: 'Procurement',
    tags: ['vendor-risk', 'third-party', 'soc2', 'audit'],
    author: 'Third-Party Risk Office',
    version: 'v3.1',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 96,
    clauseCount: 18,
    readingTime: '9 min',
    relatedDocs: ['Vendor Master Purchase Agreement', 'Vendor Onboarding & Risk Due Diligence SOP'],
    versionHistory: [
      { version: 'v3.1', date: '30 Apr 2026', author: 'Third-Party Risk Office', changes: 'Mandated annual SIG Lite questionnaires for SaaS vendors.', status: 'APPROVED' }
    ],
    summary: 'Framework governing third-party vendor risk scoring, mandatory SOC 2 Type II report verification, annual penetration test reviews, and SIG Lite questionnaires.',
    body: `# THIRD-PARTY VENDOR SECURITY RISK POLICY

## SECTION 1. VENDOR RISK CLASSIFICATION
1.1 Vendors handling Tier-1 Critical Data must undergo annual SOC 2 Type II and penetration test audits.`
  },

  {
    title: 'Document & Data Retention Policy',
    category: 'Company Policies',
    collection: 'Finance',
    tags: ['retention', 'legal-hold', 'archival', 'deletion'],
    author: 'Records Governance',
    version: 'v2.7',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 15,
    readingTime: '7 min',
    relatedDocs: ['Global Data Privacy Policy'],
    versionHistory: [
      { version: 'v2.7', date: '14 Jan 2026', author: 'Records Governance', changes: 'Updated tax record retention period to 7 years.', status: 'APPROVED' }
    ],
    summary: 'Corporate records retention schedule defining mandatory storage and destruction timelines (Tax: 7 yrs, HR: 6 yrs, Contracts: 10 yrs post-expiration) and Legal Hold overrides.',
    body: `# DOCUMENT & DATA RETENTION POLICY

## SECTION 1. RETENTION SCHEDULE
1.1 Tax Records: 7 years. Employment Records: 6 years post-termination. Contracts: 10 years post-expiration.
1.2 Legal Hold: Overrides all automated purge routines upon issuance of litigation notice.`
  },

  // --- COMPLIANCE DOCUMENTS ---
  {
    title: 'GDPR Compliance Checklist & Operational Manual',
    category: 'Compliance Documents',
    collection: 'Privacy',
    tags: ['gdpr', 'eu-privacy', 'dpia', 'consent'],
    author: 'DPO',
    version: 'v3.4',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 28,
    readingTime: '16 min',
    relatedDocs: ['Data Processing Agreement (DPA)', 'Global Data Privacy Policy'],
    versionHistory: [
      { version: 'v3.4', date: '04 Jun 2026', author: 'DPO', changes: 'Refined EDPB guidelines on legitimate interest assessments.', status: 'APPROVED' }
    ],
    summary: 'Operational manual detailing GDPR compliance execution: DPIA triggers, RoPA maintenance, cookie consent banners, sub-processor registers, and 72h DPA breach notice.',
    body: `# GDPR COMPLIANCE CHECKLIST & OPERATIONAL MANUAL

## SECTION 1. LAWFUL BASIS & CONSENT MANAGEMENT
1.1 Document lawful basis for all 6 GDPR processing grounds prior to data ingestion.`
  },

  {
    title: 'Digital Personal Data Protection (DPDP) Act Compliance Guide',
    category: 'Compliance Documents',
    collection: 'Privacy',
    tags: ['dpdp', 'india-privacy', 'consent-manager', 'fiduciary'],
    author: 'India Legal Lead',
    version: 'v1.8',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: ['Consent Manager Technical Spec'],
    complianceCoverage: 95,
    clauseCount: 20,
    readingTime: '12 min',
    relatedDocs: ['Global Data Privacy Policy', 'RBI Outsourcing Guidelines Checklist'],
    versionHistory: [
      { version: 'v1.8', date: '21 May 2026', author: 'India Legal Lead', changes: 'Updated for DPDP 2023 Central Rule notifications.', status: 'APPROVED' }
    ],
    summary: 'Comprehensive legal guide for India DPDP Act 2023 compliance: Data Fiduciary duties, Significant Data Fiduciary (SDF) requirements, and Data Protection Board penalty prevention.',
    body: `# DPDP ACT COMPLIANCE GUIDE (INDIA 2023)

## SECTION 1. OBLIGATIONS OF DATA FIDUCIARIES
1.1 Notice & Consent: Clear, itemized notice in English and 22 scheduled Indian languages.
1.2 Data Principal Rights: Right to access, summary of processing, and grievance redressal within 7 days.`
  },

  {
    title: 'ISO 27001 Annex A Control Guidance',
    category: 'Compliance Documents',
    collection: 'Compliance',
    tags: ['iso27001', 'audit', 'controls', 'isms'],
    author: 'Compliance Manager',
    version: 'v4.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 35,
    readingTime: '20 min',
    relatedDocs: ['SOC 2 Type II Preparation Playbook', 'Information Security Policy (ISP)'],
    versionHistory: [
      { version: 'v4.0', date: '02 Feb 2026', author: 'Compliance Manager', changes: 'Mapped ISO 27001:2022 93 control structure.', status: 'APPROVED' }
    ],
    summary: 'Audit readiness matrix mapping ISO 27001:2022 Annex A controls across Organizational (A.5), People (A.6), Physical (A.7), and Technological (A.8) domains.',
    body: `# ISO 27001 ANNEX A CONTROL GUIDANCE

## SECTION 1. TECHNOLOGICAL CONTROLS (A.8)
1.1 User Endpoint Security (A.8.1), Privileged Access Management (A.8.2), and Cryptography (A.8.24).`
  },

  {
    title: 'SOC 2 Type II Preparation Playbook',
    category: 'Compliance Documents',
    collection: 'Compliance',
    tags: ['soc2', 'trust-criteria', 'audit-evidence'],
    author: 'Compliance Ops',
    version: 'v2.5',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 22,
    readingTime: '14 min',
    relatedDocs: ['ISO 27001 Annex A Control Guidance', 'Vendor Security Risk Policy'],
    versionHistory: [
      { version: 'v2.5', date: '11 Mar 2026', author: 'Compliance Ops', changes: 'Updated 6-month observation window evidence automation.', status: 'APPROVED' }
    ],
    summary: 'Step-by-step preparation playbook for AICPA SOC 2 Type II audits across Security, Availability, and Confidentiality Trust Services Criteria.',
    body: `# SOC 2 TYPE II PREPARATION PLAYBOOK

## SECTION 1. TRUST SERVICES CRITERIA (TSC) MAP
1.1 Common Criteria (CC1.0 - CC9.0) evidence collection procedures for 6-month audit observation windows.`
  },

  {
    title: 'RBI Outsourcing Guidelines Checklist',
    category: 'Compliance Documents',
    collection: 'Finance',
    tags: ['rbi', 'outsourcing', 'fintech', 'banking'],
    author: 'Fintech Legal',
    version: 'v2.0',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 96,
    clauseCount: 16,
    readingTime: '10 min',
    relatedDocs: ['DPDP Act Compliance Guide', 'Vendor Master Purchase Agreement'],
    versionHistory: [
      { version: 'v2.0', date: '28 Jun 2026', author: 'Fintech Legal', changes: 'Incorporated latest RBI IT Governance & Outsourcing circular.', status: 'APPROVED' }
    ],
    summary: 'Regulatory compliance checklist for Reserve Bank of India IT outsourcing: mandatory unhindered RBI audit access, data localization in India, and core banking system isolation.',
    body: `# RBI OUTSOURCING GUIDELINES CHECKLIST

## SECTION 1. REGULATORY AUDIT ACCESS & LOCALIZATION
1.1 Contracts MUST guarantee RBI inspectors and auditors unrestricted physical and digital access to records.
1.2 All payment transaction data must be stored exclusively within servers located physically in India.`
  },

  {
    title: 'SEBI AI & ML Governance Framework Notes',
    category: 'Compliance Documents',
    collection: 'Compliance',
    tags: ['sebi', 'ai-governance', 'trading', 'algorithms'],
    author: 'Regulatory Affairs',
    version: 'v1.1',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 92,
    clauseCount: 14,
    readingTime: '8 min',
    relatedDocs: ['Corporate AI Usage & Generative AI Policy'],
    versionHistory: [
      { version: 'v1.1', date: '09 Apr 2026', author: 'Regulatory Affairs', changes: 'Added quarterly algorithmic reporting templates.', status: 'APPROVED' }
    ],
    summary: 'SEBI circular compliance summary for artificial intelligence and machine learning applications in financial markets: sandbox testing, algorithmic bias prevention, and quarterly disclosures.',
    body: `# SEBI AI & ML GOVERNANCE FRAMEWORK NOTES

## SECTION 1. ALGORITHMIC AUDIT & TESTING
1.1 All AI models interacting with capital market data must undergo quarterly back-testing and algorithmic bias audits.`
  },

  {
    title: 'HIPAA Security & Privacy Rule Summary',
    category: 'Compliance Documents',
    collection: 'Compliance',
    tags: ['hipaa', 'phi', 'healthcare', 'business-associate'],
    author: 'Health Tech Counsel',
    version: 'v3.0',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 18,
    readingTime: '11 min',
    relatedDocs: ['Information Security Policy (ISP)'],
    versionHistory: [
      { version: 'v3.0', date: '15 Jan 2026', author: 'Health Tech Counsel', changes: 'Updated Business Associate Agreement (BAA) standards.', status: 'APPROVED' }
    ],
    summary: 'Legal overview of Protected Health Information (PHI) safeguards under HIPAA, mandatory Business Associate Agreements (BAA), and HHS OCR breach reporting.',
    body: `# HIPAA SECURITY & PRIVACY RULE SUMMARY

## SECTION 1. PHI SAFEGUARDS & BAA OBLIGATIONS
1.1 Administrative, physical, and technical safeguards required for electronic Protected Health Information (ePHI).`
  },

  {
    title: 'PCI DSS v4.0 Compliance Checklist',
    category: 'Compliance Documents',
    collection: 'Finance',
    tags: ['pci-dss', 'payments', 'card-security', 'tokenization'],
    author: 'Payment Security Counsel',
    version: 'v4.0',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 25,
    readingTime: '15 min',
    relatedDocs: ['Information Security Policy (ISP)'],
    versionHistory: [
      { version: 'v4.0', date: '31 Mar 2026', author: 'Payment Security Counsel', changes: 'Full transition to PCI DSS v4.0 standard requirements.', status: 'APPROVED' }
    ],
    summary: 'Checklist covering all 12 PCI DSS v4.0 requirements for Cardholder Data Environments (CDE), tokenization, network segmentation, and annual QSA audits.',
    body: `# PCI DSS V4.0 COMPLIANCE CHECKLIST

## SECTION 1. BUILD & MAINTAIN A SECURE NETWORK
1.1 Install and maintain Network Security Controls (NSC) to protect cardholder data.`
  },

  // --- LEGAL SOPS ---
  {
    title: 'Inbound Contract Review SOP',
    category: 'Legal SOPs',
    collection: 'Commercial',
    tags: ['sop', 'contract-review', 'turnaround', 'triage'],
    author: 'Legal Operations',
    version: 'v3.3',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 14,
    readingTime: '7 min',
    relatedDocs: ['NDA Review & Approval Workflow SOP', 'Contract Approval Delegation Matrix SOP'],
    versionHistory: [
      { version: 'v3.3', date: '12 May 2026', author: 'Legal Operations', changes: 'Standardized 24-hour initial SLA triage.', status: 'APPROVED' }
    ],
    summary: 'Standard Operating Procedure defining contract intake triage, risk score assignment, SLA targets (24-hour turnaround), and escalation triggers to Partner.',
    body: `# INBOUND CONTRACT REVIEW SOP

## SECTION 1. INTAKE & TRIAGE
1.1 All incoming contracts must be submitted via Legal Portal. Automatic intake risk scoring categorizes documents into Green, Amber, or Red.`
  },

  {
    title: 'NDA Review & Approval Workflow SOP',
    category: 'Legal SOPs',
    collection: 'Commercial',
    tags: ['sop', 'nda', 'auto-approve', 'fallback'],
    author: 'Associate Director',
    version: 'v2.6',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 10,
    readingTime: '5 min',
    relatedDocs: ['Mutual Non-Disclosure Agreement (MNDA)', 'Inbound Contract Review SOP'],
    versionHistory: [
      { version: 'v2.6', date: '01 Feb 2026', author: 'Associate Director', changes: 'Enabled automated AI redline checks for standard MNDA terms.', status: 'APPROVED' }
    ],
    summary: 'Fast-track approval workflow for NDAs: auto-approving standard corporate MNDAs, checking fallback tables, and issuing 2-hour approvals.',
    body: `# NDA REVIEW & APPROVAL WORKFLOW SOP

## SECTION 2. AUTOMATED REDLINE CHECKS
2.1 If third-party NDA matches approved fallback matrix terms (Term <= 3 yrs, Jurisdiction: Delaware/England/India), auto-approve.`
  },

  {
    title: 'Procurement Approval Process SOP',
    category: 'Legal SOPs',
    collection: 'Procurement',
    tags: ['sop', 'procurement', 'vendor-signoff'],
    author: 'Head of Procurement',
    version: 'v4.1',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 96,
    clauseCount: 16,
    readingTime: '8 min',
    relatedDocs: ['Vendor Master Purchase Agreement', 'Procurement Risk Checklist Playbook'],
    versionHistory: [
      { version: 'v4.1', date: '19 Apr 2026', author: 'Head of Procurement', changes: 'Integrated IT Security signoff requirement for all SaaS tools.', status: 'APPROVED' }
    ],
    summary: 'Mandatory procurement workflow specifying requisition intake, vendor security sign-off, commercial negotiation, and signature execution.',
    body: `# PROCUREMENT APPROVAL PROCESS SOP

## SECTION 1. REQUISITION & DUAL SIGN-OFF
1.1 Requisitions over $50k require joint approval from Legal Counsel and Finance Controller.`
  },

  {
    title: 'Vendor Onboarding & Risk Due Diligence SOP',
    category: 'Legal SOPs',
    collection: 'Procurement',
    tags: ['sop', 'vendor-onboarding', 'due-diligence', 'kyc'],
    author: 'Vendor Governance',
    version: 'v3.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 18,
    readingTime: '9 min',
    relatedDocs: ['Third-Party Vendor Security Risk Policy', 'Vendor Master Purchase Agreement'],
    versionHistory: [
      { version: 'v3.0', date: '22 Mar 2026', author: 'Vendor Governance', changes: 'Added automated sanctions and PEP screening step.', status: 'APPROVED' }
    ],
    summary: 'SOP detailing vendor background checks, sanctions screening (OFAC/UN), tax registration verification (GST/W-8BEN), and security questionnaire review.',
    body: `# VENDOR ONBOARDING & RISK DUE DILIGENCE SOP

## SECTION 1. SANCTIONS & FINANCIAL HEALTH CHECK
1.1 Run automated sanctions (OFAC/UN/EU) and PEP screening prior to issuing purchase order.`
  },

  {
    title: 'Cybersecurity Incident Response SOP',
    category: 'Legal SOPs',
    collection: 'Technology',
    tags: ['sop', 'incident-response', 'breach', 'forensics'],
    author: 'Incident Commander',
    version: 'v4.2',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 22,
    readingTime: '13 min',
    relatedDocs: ['Enterprise Cybersecurity & Zero Trust Policy', 'Data Breach Notification & Regulatory Escalation SOP'],
    versionHistory: [
      { version: 'v4.2', date: '05 Jul 2026', author: 'Incident Commander', changes: 'Updated forensic image preservation protocol.', status: 'APPROVED' }
    ],
    summary: 'Step-by-step legal incident response workflow for containing system compromises, preserving forensic evidence under attorney-client privilege, and notifying insurers.',
    body: `# CYBERSECURITY INCIDENT RESPONSE SOP

## SECTION 1. CONTAINMENT & EVIDENCE PRESERVATION
1.1 Immediately isolate affected network segments and preserve memory dumps under Attorney-Client Privilege.`
  },

  {
    title: 'Data Breach Notification & Regulatory Escalation SOP',
    category: 'Legal SOPs',
    collection: 'Privacy',
    tags: ['sop', 'data-breach', 'regulatory-notice', '72-hours'],
    author: 'Privacy Counsel',
    version: 'v3.5',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 99,
    clauseCount: 19,
    readingTime: '11 min',
    relatedDocs: ['Global Data Privacy Policy', 'GDPR Compliance Checklist & Operational Manual'],
    versionHistory: [
      { version: 'v3.5', date: '14 Jun 2026', author: 'Privacy Counsel', changes: 'Added CERT-In 6-hour reporting escalation workflow.', status: 'APPROVED' }
    ],
    summary: 'Regulatory notification timetable establishing mandatory response windows (6h CERT-In, 72h GDPR) for informing data protection authorities and affected data subjects.',
    body: `# DATA BREACH NOTIFICATION & REGULATORY ESCALATION SOP

## SECTION 1. NOTIFICATION TIMETABLE
1.1 CERT-In (India): Notify within 6 hours of incident confirmation.
1.2 GDPR DPA: Notify lead Supervisory Authority within 72 hours of becoming aware.`
  },

  {
    title: 'Contract Approval Delegation Matrix SOP',
    category: 'Legal SOPs',
    collection: 'Finance',
    tags: ['sop', 'signature-authority', 'delegation', 'approval-matrix'],
    author: 'General Counsel',
    version: 'v5.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 12,
    readingTime: '6 min',
    relatedDocs: ['Inbound Contract Review SOP'],
    versionHistory: [
      { version: 'v5.0', date: '01 Jan 2026', author: 'General Counsel', changes: 'Updated financial signature thresholds.', status: 'APPROVED' }
    ],
    summary: 'Corporate delegation of authority matrix setting monetary signature caps for Legal Counsel (<$100k), VP (<$500k), CFO (<$1M), and Board (> $1M).',
    body: `# CONTRACT APPROVAL DELEGATION MATRIX SOP

## SECTION 1. FINANCIAL SIGNATURE THRESHOLDS
1.1 Counsel: Up to $100,000. Vice President: Up to $500,000. CFO: Up to $1,000,000. Board: Above $1,000,000.`
  },

  {
    title: 'Intellectual Property Pre-Filing Review SOP',
    category: 'Legal SOPs',
    collection: 'IP',
    tags: ['sop', 'ip', 'patents', 'trademarks', 'invention-disclosure'],
    author: 'IP Lead',
    version: 'v2.1',
    status: 'APPROVED',
    riskLevel: 'LOW',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 15,
    readingTime: '7 min',
    relatedDocs: ['Software Technology Licensing Agreement'],
    versionHistory: [
      { version: 'v2.1', date: '29 Mar 2026', author: 'IP Lead', changes: 'Streamlined invention disclosure form intake.', status: 'APPROVED' }
    ],
    summary: 'Procedure for intake and review of employee Invention Disclosure Forms (IDF), conducting prior art searches, and approving patent or trade secret protection.',
    body: `# INTELLECTUAL PROPERTY PRE-FILING REVIEW SOP

## SECTION 1. INVENTION DISCLOSURE INTAKE
1.1 Review IDF within 14 business days; conduct prior art patent search using USPTO and EPO databases.`
  },

  // --- INTERNAL PLAYBOOKS ---
  {
    title: 'Contract Negotiation Playbook & Fallback Matrix',
    category: 'Internal Playbooks',
    collection: 'Commercial',
    tags: ['playbook', 'negotiation', 'fallbacks', 'redlines'],
    author: 'Senior Partner',
    version: 'v4.0',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 100,
    clauseCount: 30,
    readingTime: '22 min',
    relatedDocs: ['Master Services Agreement (MSA)', 'Inbound Contract Review SOP'],
    versionHistory: [
      { version: 'v4.0', date: '15 May 2026', author: 'Senior Partner', changes: 'Updated indemnity walk-away positions for AI deliverables.', status: 'APPROVED' }
    ],
    summary: 'Comprehensive negotiation guide providing preferred, acceptable, and walk-away positions for Indemnity, Liability Caps, IP Rights, and Governing Law.',
    body: `# CONTRACT NEGOTIATION PLAYBOOK & FALLBACK MATRIX

## SECTION 1. INDEMNIFICATION CLAUSE
1.1 Preferred Position: Mutual indemnity limited to third-party IP infringement and gross negligence.
1.2 Acceptable Fallback: Unilateral indemnity capped at 2x 12-month fees.
1.3 Walk-away Position: Uncapped general indemnity covering indirect or consequential breach.`
  },

  {
    title: 'Procurement Risk Checklist Playbook',
    category: 'Internal Playbooks',
    collection: 'Procurement',
    tags: ['playbook', 'procurement', 'checklist', 'vendor-risk'],
    author: 'Procurement Counsel',
    version: 'v3.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 95,
    clauseCount: 16,
    readingTime: '9 min',
    relatedDocs: ['Procurement Approval Process SOP', 'Vendor Master Purchase Agreement'],
    versionHistory: [
      { version: 'v3.0', date: '04 Apr 2026', author: 'Procurement Counsel', changes: 'Added auto-renewal opt-out deadline alerts.', status: 'APPROVED' }
    ],
    summary: 'Practical checklist for corporate negotiators identifying vendor contract traps: hidden auto-renewals, price escalation caps (max 3% per year), and audit fee shifts.',
    body: `# PROCUREMENT RISK CHECKLIST PLAYBOOK

## SECTION 1. PRICE ESCALATION & RENEWAL TRAPS
1.1 Cap annual price increases at maximum 3% or CPI equivalent. Require 60-day auto-renewal notice.`
  },

  {
    title: 'AI Vendor Risk Assessment Playbook',
    category: 'Internal Playbooks',
    collection: 'Technology',
    tags: ['playbook', 'ai-assessment', 'llm-risk', 'data-training'],
    author: 'AI Practice Group',
    version: 'v1.5',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 94,
    clauseCount: 18,
    readingTime: '10 min',
    relatedDocs: ['Corporate AI Usage & Generative AI Policy', 'SEBI AI & ML Governance Framework Notes'],
    versionHistory: [
      { version: 'v1.5', date: '20 Jul 2026', author: 'AI Practice Group', changes: 'Added zero-data-retention API verification steps.', status: 'APPROVED' }
    ],
    summary: 'Due diligence framework for evaluating commercial AI vendors: verifying zero data retention API parameters, model bias audits, and copyright indemnification.',
    body: `# AI VENDOR RISK ASSESSMENT PLAYBOOK

## SECTION 1. MODEL TRAINING & DATA RETENTION
1.1 Verify vendor API terms guarantee zero data retention (ZDR) and prohibit training foundation models on company inputs.`
  },

  {
    title: 'M&A Legal Due Diligence Playbook',
    category: 'Internal Playbooks',
    collection: 'Corporate',
    tags: ['playbook', 'due-diligence', 'm-and-a', 'virtual-data-room'],
    author: 'M&A Partner',
    version: 'v2.8',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 98,
    clauseCount: 25,
    readingTime: '18 min',
    relatedDocs: ['Contract Negotiation Playbook & Fallback Matrix'],
    versionHistory: [
      { version: 'v2.8', date: '10 Feb 2026', author: 'M&A Partner', changes: 'Updated VDR folder indexing structure.', status: 'APPROVED' }
    ],
    summary: 'Mergers & Acquisitions due diligence guide covering Virtual Data Room (VDR) setup, change-of-control contract analysis, pending litigation reviews, and IP audit.',
    body: `# M&A LEGAL DUE DILIGENCE PLAYBOOK

## SECTION 1. VIRTUAL DATA ROOM (VDR) INVENTORY
1.1 Review target company material contracts for Change of Control triggers and assignment consent rules.`
  },

  {
    title: 'Corporate Legal Risk Assessment Matrix',
    category: 'Internal Playbooks',
    collection: 'Litigation',
    tags: ['playbook', 'risk-matrix', 'litigation', 'exposure'],
    author: 'Risk Committee',
    version: 'v3.2',
    status: 'APPROVED',
    riskLevel: 'HIGH',
    missingClauses: [],
    complianceCoverage: 96,
    clauseCount: 15,
    readingTime: '8 min',
    relatedDocs: ['Contract Negotiation Playbook & Fallback Matrix'],
    versionHistory: [
      { version: 'v3.2', date: '02 Mar 2026', author: 'Risk Committee', changes: 'Standardized 5x5 quantitative scoring grid.', status: 'APPROVED' }
    ],
    summary: 'Quantitative 5x5 risk scoring matrix evaluating Likelihood (1-5) x Impact (1-5) across financial, regulatory, operational, and reputational dimensions.',
    body: `# CORPORATE LEGAL RISK ASSESSMENT MATRIX

## SECTION 1. 5X5 SCORING GRID
1.1 Calculate Risk Rating = Likelihood (1-5) x Financial Impact (1-5). Ratings above 15 require Board audit notification.`
  },

  {
    title: 'Commercial Dispute Resolution & Arbitration Playbook',
    category: 'Internal Playbooks',
    collection: 'Litigation',
    tags: ['playbook', 'arbitration', 'dispute-resolution', 'mediation'],
    author: 'Litigation Lead',
    version: 'v2.0',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    missingClauses: [],
    complianceCoverage: 97,
    clauseCount: 20,
    readingTime: '12 min',
    relatedDocs: ['Master Services Agreement (MSA)'],
    versionHistory: [
      { version: 'v2.0', date: '18 Jan 2026', author: 'Litigation Lead', changes: 'Updated SIAC and LCIA institutional arbitration rules.', status: 'APPROVED' }
    ],
    summary: 'Strategy playbook for commercial disputes: pre-arbitration 30-day executive negotiation, choice of arbitration seat (London/Singapore/New York/Mumbai), and emergency relief.',
    body: `# COMMERCIAL DISPUTE RESOLUTION & ARBITRATION PLAYBOOK

## SECTION 1. ESCALATION & MANDATORY MEDIATION
1.1 Require 30-day C-suite negotiation window before initiating formal SIAC or LCIA arbitration proceedings.`
  }
];

async function seed() {
  console.log(`Starting knowledge base seeding for ${seedDocuments.length} enterprise documents...`);

  // Find or use default organization
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('No Organization found in DB! Please sign up or create an organization first.');
    process.exit(1);
  }

  console.log(`Seeding into Organization: ${org.name} (${org.id})`);

  let count = 0;
  for (const doc of seedDocuments) {
    const textToEmbed = `${doc.title}\n${doc.category}\n${doc.summary}\n${doc.tags.join(' ')}\n${doc.body}`;
    const embedding = generateHashEmbedding(textToEmbed, 384);

    // Structure content payload with rich metadata header + markdown body
    const structuredContent = JSON.stringify({
      version: doc.version,
      author: doc.author,
      status: doc.status,
      collection: doc.collection,
      riskLevel: doc.riskLevel,
      missingClauses: doc.missingClauses,
      complianceCoverage: doc.complianceCoverage,
      clauseCount: doc.clauseCount,
      readingTime: doc.readingTime,
      relatedDocs: doc.relatedDocs,
      versionHistory: doc.versionHistory,
      summary: doc.summary,
      body: doc.body
    });

    await prisma.knowledgeBaseItem.create({
      data: {
        title: doc.title,
        content: structuredContent,
        category: doc.category,
        tags: doc.tags,
        embedding: embedding,
        organizationId: org.id
      }
    });

    count++;
    process.stdout.write(`\rSeeded ${count}/${seedDocuments.length}: ${doc.title.substring(0, 35)}...`);
  }

  console.log('\n✅ Successfully seeded Knowledge Base with all 47 enterprise documents!');
}

seed()
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
