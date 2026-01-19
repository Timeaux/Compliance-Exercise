// Extended document data with versioning, feedback history, and AI-suggested comments
// Per OBJECTIVES.md - unique content per document

export interface DecisionNode {
    id: string;
    regulation: string;
    description: string;
    result: 'pass' | 'fail' | 'flag';
    confidence: number;
    children?: DecisionNode[];
}

export interface Comment {
    id: string;
    author: 'analyst' | 'marketing' | 'ai';
    text: string;
    timestamp: string;
    aiSuggestion?: string; // Pre-filled AI suggestion in light grey
}

export interface ComplianceTask {
    id: number;
    text: string;
    type: 'high' | 'medium' | 'compliant';
    confidence: number;
    violation?: string;
    reasoning: string;
    decisionTree: DecisionNode;
    comments: Comment[];
    aiSuggestedComment: string; // AI-generated comment suggestion
}

export interface AuditEntry {
    id: string;
    timestamp: string;
    actor: 'agent' | 'analyst' | 'marketing';
    action: string;
    details: string;
}

export interface VersionChange {
    original: string;
    revised: string;
    lineNumber: number;
    type: 'modification' | 'addition' | 'deletion';
}

export interface DocumentVersion {
    version: number;
    content: string;
    timestamp: string;
    author: 'marketing' | 'analyst';
    changes?: VersionChange[];
    status?: 'pending' | 'approved' | 'rejected';
}

export interface DocumentData {
    id: string;
    title: string;
    type: string;
    lastModified: string;
    complianceScore: number;
    content: string;
    tasks: ComplianceTask[];
    auditHistory: AuditEntry[];
    versions: DocumentVersion[];
    documentCategory: string;
    matchedRegulation: string;
    policyReference: string;
    assignedPolicies: string[];
}

// AI comment generator based on violation type
export function generateAIComment(task: ComplianceTask): string {
    if (task.type === 'compliant') {
        return `No changes required. "${task.text}" meets compliance standards.`;
    }

    const severity = task.type === 'high' ? 'Critical' : 'Recommended';
    return `${severity} revision needed: The phrase "${task.text}" violates ${task.violation}. Please revise to remove ${task.violation?.includes('Promissory') ? 'any guarantee language' :
        task.violation?.includes('Urgency') ? 'artificial urgency' :
            task.violation?.includes('Risk') ? 'misleading risk claims' :
                'non-compliant language'
        }. Suggested alternative: ${task.text.toLowerCase().includes('guaranteed') ? '"targeted returns" or "historical performance"' :
            task.text.toLowerCase().includes('risk-free') ? '"managed risk approach"' :
                task.text.toLowerCase().includes('limited time') ? 'remove deadline pressure or add clear disclosure' :
                    'compliant alternative phrasing'
        }.`;
}

export const documents: Record<string, DocumentData> = {
    '1': {
        id: '1',
        title: 'Q1 Marketing Flyer',
        type: 'PDF',
        lastModified: 'Today, 2:34 PM',
        complianceScore: 92,
        documentCategory: 'Marketing Material',
        matchedRegulation: 'SEC Regulation 12.3 - Investment Advertising',
        policyReference: 'POL-2024-001: Marketing Communications Standards',
        assignedPolicies: ['pol-001'],
        content: `Q1 MARKETING FLYER
Investment Opportunities for the Modern Investor

Dear Valued Investor,

We are excited to present our exclusive Q1 investment opportunities. Our fund has consistently delivered strong performance, and we're confident in our ability to continue this trend. As a leader in the financial services industry, we take pride in offering investment solutions tailored to your unique financial goals.

INVESTMENT HIGHLIGHTS
Our flagship Global Growth Fund offers Guaranteed Returns of up to 12% annually. This exceptional opportunity combines professional portfolio management with a diversified asset allocation strategy designed to maximize your wealth.

KEY BENEFITS FOR INVESTORS
• Guaranteed Returns of up to 12% annually
• Professional portfolio management by seasoned experts
• Diversified asset allocation across global markets
• Access to exclusive investment opportunities
• limited time offer - expires March 31st

PROVEN EXPERTISE
Our team of expert analysts carefully selects each investment based on rigorous due diligence. With over 20 years of experience navigating complex market conditions, we understand what it takes to build wealth. Our proprietary research methodology has helped thousands of clients achieve their financial objectives.

WHY CHOOSE OUR FIRM?
• Proven track record of consistent outperformance
• Transparent fee structure with no hidden costs
• Dedicated client support available 24/7
• State-of-the-art digital platform for portfolio monitoring
• Regular market insights and investment updates
• Terms and conditions apply

GETTING STARTED
Opening an account is simple. Contact your dedicated relationship manager or visit our website to complete your application. Our streamlined onboarding process ensures you can start investing within 48 hours.

CONTACT INFORMATION
Investor Relations: 1-800-555-INVEST
Email: invest@globalfund.example.com
Website: www.globalfund.example.com

Contact us today to schedule your consultation and take the first step toward financial freedom. Our team is ready to help you achieve your investment goals.

This document is for informational purposes only and does not constitute investment advice.`,
        versions: [
            {
                version: 1,
                content: `Q1 MARKETING FLYER - Investment Opportunities...`,
                timestamp: '2026-01-18T10:00:00',
                author: 'marketing',
                status: 'approved'
            },
            {
                version: 2,
                content: `Q1 MARKETING FLYER
Investment Opportunities for the Modern Investor

Dear Valued Investor,

We are excited to present our exclusive Q1 investment opportunities. Our fund has consistently delivered strong performance based on historical data. As a leader in the financial services industry, we take pride in offering investment solutions tailored to your unique financial goals.

INVESTMENT HIGHLIGHTS
Our flagship Global Growth Fund offers Historical Returns of up to 12% annually based on past performance. This opportunity combines professional portfolio management with a diversified asset allocation strategy designed to help grow your wealth.

KEY BENEFITS FOR INVESTORS
• Historical Returns of up to 12% annually
• Professional portfolio management by seasoned experts
• Diversified asset allocation across global markets
• Access to exclusive investment opportunities
• Offer available through March 31st

PROVEN EXPERTISE
Our team of expert analysts carefully selects each investment based on rigorous due diligence. With over 20 years of experience navigating complex market conditions, we understand what it takes to build wealth. Our proprietary research methodology has helped thousands of clients work toward their financial objectives.

WHY CHOOSE OUR FIRM?
• Track record of strong historical performance
• Transparent fee structure with no hidden costs
• Dedicated client support available 24/7
• State-of-the-art digital platform for portfolio monitoring
• Regular market insights and investment updates
• Terms and conditions apply
• Past performance is not indicative of future results

GETTING STARTED
Opening an account is simple. Contact your dedicated relationship manager or visit our website to complete your application. Our streamlined onboarding process ensures you can start investing within 48 hours.

CONTACT INFORMATION
Investor Relations: 1-800-555-INVEST
Email: invest@globalfund.example.com
Website: www.globalfund.example.com

Contact us today to schedule your consultation and discuss your investment goals. Our team is ready to help you work toward financial success.

This document is for informational purposes only and does not constitute investment advice. All investments involve risk, including possible loss of principal.`,
                timestamp: '2026-01-19T09:15:00',
                author: 'marketing',
                status: 'pending',
                changes: [
                    { original: 'we\'re confident in our ability to continue this trend', revised: 'based on historical data', lineNumber: 5, type: 'modification' },
                    { original: 'Guaranteed Returns', revised: 'Historical Returns', lineNumber: 8, type: 'modification' },
                    { original: 'maximize your wealth', revised: 'help grow your wealth', lineNumber: 8, type: 'modification' },
                    { original: 'Guaranteed Returns', revised: 'Historical Returns', lineNumber: 12, type: 'modification' },
                    { original: 'limited time offer - expires', revised: 'Offer available through', lineNumber: 16, type: 'modification' },
                    { original: 'achieve their financial objectives', revised: 'work toward their financial objectives', lineNumber: 19, type: 'modification' },
                    { original: 'Proven track record of consistent outperformance', revised: 'Track record of strong historical performance', lineNumber: 22, type: 'modification' },
                    { original: '', revised: 'Past performance is not indicative of future results', lineNumber: 28, type: 'addition' },
                    { original: 'take the first step toward financial freedom', revised: 'discuss your investment goals', lineNumber: 35, type: 'modification' },
                    { original: 'help you achieve your investment goals', revised: 'help you work toward financial success', lineNumber: 35, type: 'modification' },
                    { original: '', revised: 'All investments involve risk, including possible loss of principal.', lineNumber: 37, type: 'addition' }
                ]
            }
        ],
        tasks: [
            {
                id: 1,
                text: 'Guaranteed Returns',
                type: 'high',
                confidence: 98,
                violation: 'Promissory Language (Reg 12.3)',
                reasoning: `This phrase was flagged because it uses promissory language that implies certainty of investment returns.

**Why this matters:**
Investment returns are inherently uncertain. Using "guaranteed" creates a misleading impression.

**Regulatory Context:**
SEC prohibits terms like "guaranteed" in relation to investment returns.

**Recommendation:**
Replace with "targeted returns" or "historical returns of approximately X%."`,
                decisionTree: {
                    id: 'root',
                    regulation: 'Securities Act Compliance',
                    description: 'Evaluating marketing claim',
                    result: 'fail',
                    confidence: 98,
                    children: [
                        {
                            id: 'node1',
                            regulation: 'Reg 12.3 - Promissory Language',
                            description: 'Check for performance guarantees',
                            result: 'fail',
                            confidence: 98,
                            children: [
                                { id: 'node1a', regulation: 'Keyword Detection', description: 'Found "Guaranteed"', result: 'fail', confidence: 99 },
                                { id: 'node1b', regulation: 'Context Analysis', description: 'No third-party backing', result: 'fail', confidence: 95 }
                            ]
                        }
                    ]
                },
                comments: [
                    { id: 'c1', author: 'ai', text: 'This phrase requires immediate revision per SEC guidelines.', timestamp: '2026-01-18T14:34:00' }
                ],
                aiSuggestedComment: 'Critical revision needed: Replace "Guaranteed Returns" with "Historical returns" or "Targeted returns" to comply with SEC Regulation 12.3. The current phrasing implies certainty which is prohibited for investment products.'
            },
            {
                id: 2,
                text: 'limited time offer',
                type: 'medium',
                confidence: 72,
                violation: 'Urgency Pressure (UDAAP Guidelines)',
                reasoning: `This phrase creates artificial urgency that may pressure investors.

**Regulatory Context:**
UDAAP guidelines consider undue time pressure potentially manipulative.

**Recommendation:**
If genuine, ensure clear disclosure of the specific deadline.`,
                decisionTree: {
                    id: 'root',
                    regulation: 'UDAAP Compliance',
                    description: 'Evaluating urgency language',
                    result: 'flag',
                    confidence: 72,
                    children: [
                        { id: 'node1', regulation: 'Urgency Language', description: 'Detected time-pressure', result: 'flag', confidence: 72 }
                    ]
                },
                comments: [],
                aiSuggestedComment: 'Recommended revision: Consider rephrasing "limited time offer" to "available through [specific date]" with clear terms. This reduces pressure language while maintaining promotional intent.'
            },
            {
                id: 3,
                text: 'Terms and conditions apply',
                type: 'compliant',
                confidence: 95,
                reasoning: `Verified as compliant. Standard disclosure practice.`,
                decisionTree: {
                    id: 'root',
                    regulation: 'Disclosure Requirements',
                    description: 'Verifying required disclosures',
                    result: 'pass',
                    confidence: 95,
                    children: [
                        { id: 'node1', regulation: 'T&C Disclosure', description: 'Present and visible', result: 'pass', confidence: 95 }
                    ]
                },
                comments: [],
                aiSuggestedComment: 'No changes required. This disclosure meets compliance standards.'
            }
        ],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-18T14:34:00', actor: 'agent', action: 'Initial Analysis', details: 'AI compliance scan completed. Found 3 items.' },
            { id: 'a2', timestamp: '2026-01-18T14:35:00', actor: 'agent', action: 'High Priority Flag', details: 'Flagged "Guaranteed Returns".' },
            { id: 'a3', timestamp: '2026-01-18T16:20:00', actor: 'analyst', action: 'Sent to Marketing', details: 'Document sent with 2 revision requests.' },
            { id: 'a4', timestamp: '2026-01-19T09:15:00', actor: 'marketing', action: 'V2 Submitted', details: 'Revised version uploaded for review.' }
        ]
    },
    '2': {
        id: '2',
        title: 'Investment Prospectus 2026',
        type: 'PDF',
        lastModified: 'Yesterday',
        complianceScore: 78,
        documentCategory: 'Prospectus',
        matchedRegulation: 'SEC Rule 156 - Investment Company Sales Literature',
        policyReference: 'POL-2024-002: Fund Prospectus Requirements',
        assignedPolicies: ['pol-002'],
        content: `INVESTMENT PROSPECTUS 2026
Global Growth Fund Series A
Prepared by: Investment Management Division

IMPORTANT NOTICE
This prospectus contains information you should consider before investing. Please read carefully and consult with a financial advisor before making any investment decisions.

FUND OVERVIEW
The Global Growth Fund ("the Fund") seeks long-term capital appreciation through investments in domestic and international equity securities. The Fund employs a best-in-class investment strategy that has consistently outperformed market benchmarks across multiple market cycles.

INVESTMENT OBJECTIVE
Our primary objective is to generate superior risk-adjusted returns for our investors. The Fund invests primarily in large-cap and mid-cap equity securities across developed and emerging markets.

RISK-FREE INVESTMENT OPPORTUNITY
Our diversified approach minimizes risk while maximizing returns. Investors can expect steady growth with minimal volatility. The Fund's sophisticated hedging strategies protect against market downturns.

INVESTMENT STRATEGY
The Fund utilizes a combination of fundamental analysis, quantitative modeling, and technical indicators to identify investment opportunities. Our proprietary screening process evaluates over 10,000 securities globally to find the most attractive risk-reward opportunities.

HISTORICAL PERFORMANCE
The following represents the Fund's performance over the past three years:
• 2025: +18.5% (vs S&P 500: +12.3%)
• 2024: +22.1% (vs S&P 500: +15.8%)
• 2023: +15.7% (vs S&P 500: +11.2%)

Past performance guarantees future results. Investors should expect similar returns going forward based on our proven methodology.

MANAGEMENT TEAM
The Fund is managed by a team of experienced investment professionals with an average of 25 years of industry experience. Lead portfolio manager Sarah Chen has overseen the fund since 2018.

FEES AND EXPENSES
The following fees apply to investments in the Fund:
• Management Fee: 1.25% annually
• Performance Fee: 20% of gains above benchmark
• Administrative Fee: 0.15% annually
• Trading Costs: Approximately 0.10% annually

MINIMUM INVESTMENT
$25,000 initial investment required for Standard accounts.
$10,000 minimum for IRA accounts.

INVESTOR ELIGIBILITY
For accredited investors only. Accredited investor status verification required prior to investment.

REDEMPTION POLICY
Redemptions are processed monthly with 30-day notice. Early redemption fees of 2% apply for holdings under 12 months.

CONTACT INFORMATION
Fund Administrator: Global Services LLC
Phone: 1-800-555-FUND
Email: prospectus@globalfund.example.com`,
        versions: [
            {
                version: 1,
                content: `INVESTMENT PROSPECTUS 2026...`,
                timestamp: '2026-01-15T11:00:00',
                author: 'marketing',
                status: 'pending'
            }
        ],
        tasks: [
            {
                id: 1,
                text: 'Risk-Free Investment',
                type: 'high',
                confidence: 99,
                violation: 'Misleading Risk Disclosure (SEC Rule 156)',
                reasoning: `"Risk-free" is prohibited in investment prospectuses. All investments carry inherent risk.`,
                decisionTree: {
                    id: 'root', regulation: 'SEC Rule 156', description: 'Checking risk disclosures', result: 'fail', confidence: 99,
                    children: [{ id: 'node1', regulation: 'Risk-Free Claims', description: 'Prohibited language detected', result: 'fail', confidence: 99 }]
                },
                comments: [],
                aiSuggestedComment: 'Critical: Remove "Risk-Free" immediately. SEC Rule 156 explicitly prohibits this claim. Suggest replacing with "Risk-Managed Investment Approach" or removing the section header entirely.'
            },
            {
                id: 2,
                text: 'Past performance guarantees future results',
                type: 'high',
                confidence: 97,
                violation: 'Forward-Looking Statements (SEC Reg)',
                reasoning: `This statement contradicts required SEC disclaimers.`,
                decisionTree: {
                    id: 'root', regulation: 'SEC Performance Disclaimers', description: 'Verifying disclaimers', result: 'fail', confidence: 97,
                    children: [{ id: 'node1', regulation: 'Disclaimer Check', description: 'Missing required disclaimer', result: 'fail', confidence: 97 }]
                },
                comments: [],
                aiSuggestedComment: 'Critical: This statement is factually incorrect and legally problematic. Replace with the required disclaimer: "Past performance is not indicative of future results."'
            },
            {
                id: 3,
                text: 'best-in-class',
                type: 'medium',
                confidence: 65,
                violation: 'Superlative Claims (FINRA Rule 2210)',
                reasoning: `Superlative claims require substantiation.`,
                decisionTree: {
                    id: 'root', regulation: 'FINRA Rule 2210', description: 'Checking superlatives', result: 'flag', confidence: 65,
                    children: [{ id: 'node1', regulation: 'Superlative Detection', description: 'Unsubstantiated claim', result: 'flag', confidence: 65 }]
                },
                comments: [],
                aiSuggestedComment: 'Recommended: Either substantiate "best-in-class" with third-party verification (e.g., Morningstar rating) or replace with "competitive" or "strong-performing".'
            },
            {
                id: 4,
                text: 'expect steady growth with minimal volatility',
                type: 'medium',
                confidence: 75,
                violation: 'Performance Expectation (SEC Rule 156)',
                reasoning: `Setting expectations about volatility without proper disclosure is misleading.`,
                decisionTree: {
                    id: 'root', regulation: 'SEC Rule 156', description: 'Volatility claims', result: 'flag', confidence: 75,
                    children: [{ id: 'node1', regulation: 'Volatility Language', description: 'Potentially misleading', result: 'flag', confidence: 75 }]
                },
                comments: [],
                aiSuggestedComment: 'Recommended: Remove "expect steady growth with minimal volatility" or qualify with historical volatility data and appropriate disclaimers.'
            }
        ],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-17T10:00:00', actor: 'agent', action: 'Initial Analysis', details: 'Found 7 items requiring review.' }
        ]
    },
    '3': {
        id: '3',
        title: 'Client Onboarding Guide',
        type: 'DOCX',
        lastModified: 'Jan 15, 2026',
        complianceScore: 100,
        documentCategory: 'Internal Documentation',
        matchedRegulation: 'FINRA Rule 2090 - Know Your Customer',
        policyReference: 'POL-2024-003: Client Communication Guidelines',
        assignedPolicies: ['pol-003'],
        content: `CLIENT ONBOARDING GUIDE
Version 3.2 | Effective January 2026
Department: Client Services

WELCOME TO OUR FIRM
Thank you for choosing our firm for your investment needs. This guide will walk you through the account opening process and explain what to expect as a new client.

ABOUT THIS DOCUMENT
This onboarding guide provides step-by-step instructions for new clients. Please review each section carefully and contact our Client Services team if you have questions.

REQUIRED DOCUMENTATION
To open your account, please provide the following documents:
1. Government-issued photo ID (passport, driver's license)
2. Proof of address (utility bill, bank statement dated within 60 days)
3. Social Security Number or Tax Identification Number
4. Completed W-9 form (US persons) or W-8BEN (non-US persons)
5. Source of funds documentation (if applicable)

ACCOUNT TYPES AVAILABLE
We offer various account types to meet your needs:
• Individual Brokerage Account
• Joint Tenancy with Rights of Survivorship
• Traditional IRA
• Roth IRA
• SEP IRA
• Trust Account
• Corporate/LLC Account

KYC VERIFICATION PROCESS
All clients must complete Know Your Customer (KYC) verification before trading. This regulatory requirement helps us verify your identity and protect against fraud. The verification process typically takes 1-3 business days.

SUITABILITY ASSESSMENT
During onboarding, we will assess your investment objectives, risk tolerance, time horizon, and financial situation. This information helps us ensure that our services and recommendations are suitable for your needs.

ACCOUNT FUNDING OPTIONS
Once your account is approved, you can fund it through:
• Wire transfer (domestic or international)
• ACH transfer from a linked bank account
• Check deposit
• Asset transfer from another brokerage

NEXT STEPS AFTER APPROVAL
1. Review and sign account agreements
2. Complete electronic consent forms
3. Fund your account
4. Schedule introductory call with your advisor

CONTACT INFORMATION
Client Services: 1-800-555-0123
Email: onboarding@firm.example.com
Hours: Monday-Friday, 8AM-8PM ET`,
        versions: [
            { version: 1, content: `CLIENT ONBOARDING GUIDE v3.1...`, timestamp: '2025-11-01T09:00:00', author: 'analyst', status: 'approved' },
            {
                version: 2, content: `CLIENT ONBOARDING GUIDE v3.2...`, timestamp: '2026-01-15T09:00:00', author: 'analyst', status: 'approved', changes: [
                    { original: 'v3.1', revised: 'v3.2', lineNumber: 2, type: 'modification' },
                    { original: 'Effective November 2025', revised: 'Effective January 2026', lineNumber: 2, type: 'modification' },
                    { original: '', revised: 'Source of funds documentation (if applicable)', lineNumber: 15, type: 'addition' },
                    { original: '', revised: 'SEP IRA', lineNumber: 22, type: 'addition' }
                ]
            }
        ],
        tasks: [],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-15T09:00:00', actor: 'agent', action: 'Initial Analysis', details: 'No issues found.' },
            { id: 'a2', timestamp: '2026-01-15T09:05:00', actor: 'analyst', action: 'Approved', details: 'Document approved for distribution.' }
        ]
    },
    '4': {
        id: '4',
        title: 'Risk Disclosure Statement',
        type: 'PDF',
        lastModified: 'Jan 14, 2026',
        complianceScore: 85,
        documentCategory: 'Legal Disclosure',
        matchedRegulation: 'SEC Advertising Rule - Track Record Claims',
        policyReference: 'POL-2024-006: Risk Disclosure Standards',
        assignedPolicies: ['pol-006'],
        content: `RISK DISCLOSURE STATEMENT
Effective Date: January 2026

INTRODUCTION
This document provides important information about the risks associated with investing. Please read this disclosure carefully before opening an account or making any investment decisions.

GENERAL INVESTMENT RISKS
All investments involve risk, including the possible loss of principal. The value of your investments may fluctuate, and you may receive less than your original investment when you sell.

MARKET RISK
Investments are subject to market fluctuations, which may result from economic conditions, political events, natural disasters, or other factors. Market values can decline rapidly and substantially.

LIQUIDITY RISK
Some investments may be difficult to sell quickly at a fair price. This is particularly true for safe haven assets like our recommended holdings. Less liquid investments may require longer holding periods.

INTEREST RATE RISK
Fixed income investments are subject to interest rate risk. When interest rates rise, bond prices typically fall. The longer the duration of a bond, the more sensitive it is to interest rate changes.

CREDIT RISK
Debt securities are subject to the risk that the issuer may be unable to make interest payments or repay principal. Lower-rated securities carry higher credit risk.

LEVERAGE RISK
Using borrowed funds or derivatives amplifies both gains and losses. Leveraged investments can result in losses that exceed your original investment.

CURRENCY RISK
Investments in foreign securities are subject to currency fluctuation risk. Changes in exchange rates can significantly affect the value of international investments.

HISTORICAL PERFORMANCE NOTE
IMPORTANT: Our investment products have never experienced a loss during market corrections. This track record demonstrates the effectiveness of our risk management approach.

ACKNOWLEDGMENT
By signing below, you acknowledge that you have read and understood these risks. You understand that investing involves the potential for loss, and that past performance is not a guarantee of future results.

Signature: _____________________
Date: _____________________
Print Name: _____________________

For questions about this disclosure, contact:
Compliance Department: compliance@firm.example.com
Phone: 1-800-555-RISK`,
        versions: [
            { version: 1, content: `RISK DISCLOSURE STATEMENT...`, timestamp: '2026-01-14T11:00:00', author: 'marketing', status: 'pending' }
        ],
        tasks: [
            {
                id: 1,
                text: 'never experienced a loss',
                type: 'high',
                confidence: 94,
                violation: 'Misleading Track Record (SEC Advertising Rule)',
                reasoning: `Claiming "never experienced a loss" is misleading.`,
                decisionTree: {
                    id: 'root', regulation: 'SEC Advertising Rule', description: 'Verifying track record', result: 'fail', confidence: 94,
                    children: [{ id: 'node1', regulation: 'Loss History', description: 'Misleading claim detected', result: 'fail', confidence: 94 }]
                },
                comments: [
                    { id: 'c1', author: 'analyst', text: 'Need to verify historical data before approving any revision.', timestamp: '2026-01-14T15:00:00' }
                ],
                aiSuggestedComment: 'Critical: Remove or qualify this claim. If historically accurate, add context: "During the period from [date] to [date], [specific conditions]." Otherwise, remove entirely.'
            },
            {
                id: 2,
                text: 'safe haven assets',
                type: 'medium',
                confidence: 68,
                violation: 'Safety Implication (Investment Advisers Act)',
                reasoning: `"Safe haven" implies safety which may not be accurate.`,
                decisionTree: {
                    id: 'root', regulation: 'Investment Advisers Act', description: 'Checking safety language', result: 'flag', confidence: 68,
                    children: [{ id: 'node1', regulation: 'Safety Language', description: 'Potentially misleading', result: 'flag', confidence: 68 }]
                },
                comments: [],
                aiSuggestedComment: 'Recommended: Replace "safe haven assets" with "diversified assets" or "defensive holdings" to avoid implying guaranteed safety.'
            }
        ],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-14T11:00:00', actor: 'agent', action: 'Initial Analysis', details: 'Found 4 items.' },
            { id: 'a2', timestamp: '2026-01-14T15:00:00', actor: 'analyst', action: 'Comment Added', details: 'Analyst added note on loss history claim.' }
        ]
    },
    '5': {
        id: '5',
        title: 'Q4 Performance Report',
        type: 'PDF',
        lastModified: 'Jan 10, 2026',
        complianceScore: 95,
        documentCategory: 'Performance Report',
        matchedRegulation: 'FINRA Rule 2210 - Comparative Advertising',
        policyReference: 'POL-2024-004: Performance Reporting Standards',
        assignedPolicies: ['pol-004'],
        content: `Q4 2025 PERFORMANCE REPORT
Global Balanced Portfolio
Report Date: January 10, 2026

EXECUTIVE SUMMARY
Q4 2025 delivered solid returns across our managed portfolios. Despite market volatility in October and November, strategic positioning allowed us to capture gains while managing downside risk.

MARKET OVERVIEW
Global equity markets experienced mixed performance in Q4 2025. US markets rallied on positive economic data, while international markets faced headwinds from currency movements and geopolitical concerns.

PORTFOLIO PERFORMANCE
Total Return (Q4): +4.2%
Year-to-Date: +15.8%
Benchmark (60/40): +3.1% (Q4)
Benchmark (60/40): +11.2% (YTD)

ATTRIBUTION ANALYSIS
The portfolio's outperformance was driven by:
• Overweight in technology sector (+1.2% contribution)
• Underweight in energy sector (+0.3% contribution)
• Strong fixed income allocation (+0.4% contribution)

ASSET ALLOCATION
Current allocation vs targets:
• Equities: 55% (target: 55%)
• Fixed Income: 30% (target: 30%)
• Alternatives: 10% (target: 10%)
• Cash: 5% (target: 5%)

COMPARISON TO PEERS
Our fund ranked in the top quartile among peers. We significantly outperformed most competitors thanks to our superior stock selection and timing decisions.

TOP HOLDINGS
1. Apple Inc. (AAPL) - 4.2%
2. Microsoft Corp (MSFT) - 3.8%
3. Amazon.com Inc (AMZN) - 3.1%
4. Alphabet Inc (GOOGL) - 2.9%
5. NVIDIA Corp (NVDA) - 2.5%

OUTLOOK FOR Q1 2026
We maintain a cautiously optimistic outlook for Q1 2026. Key factors to monitor include Federal Reserve policy decisions, corporate earnings, and geopolitical developments.

DISCLAIMER
Past performance is not indicative of future results. The information in this report is for informational purposes only and does not constitute investment advice.

Source: Internal calculations based on custodian data. Benchmark data from Bloomberg.`,
        versions: [
            { version: 1, content: `Q4 2025 PERFORMANCE REPORT...`, timestamp: '2026-01-10T09:00:00', author: 'marketing', status: 'approved' },
            {
                version: 2, content: `Q4 2025 PERFORMANCE REPORT (revised)...`, timestamp: '2026-01-12T14:00:00', author: 'marketing', status: 'pending', changes: [
                    { original: 'significantly outperformed most competitors', revised: 'outperformed the category average by 2.1%', lineNumber: 30, type: 'modification' },
                    { original: 'superior stock selection and timing decisions', revised: 'disciplined investment process', lineNumber: 30, type: 'modification' },
                    { original: '', revised: 'Source: Morningstar Direct, category average calculation', lineNumber: 31, type: 'addition' }
                ]
            }
        ],
        tasks: [
            {
                id: 1,
                text: 'significantly outperformed most competitors',
                type: 'medium',
                confidence: 71,
                violation: 'Comparative Claims (FINRA Rule 2210)',
                reasoning: `Comparative claims require specific data.`,
                decisionTree: {
                    id: 'root', regulation: 'FINRA Rule 2210', description: 'Checking comparisons', result: 'flag', confidence: 71,
                    children: [{ id: 'node1', regulation: 'Comparative Substantiation', description: 'Needs specifics', result: 'flag', confidence: 71 }]
                },
                comments: [
                    { id: 'c1', author: 'marketing', text: 'Revised to include specific percentage.', timestamp: '2026-01-12T14:00:00' }
                ],
                aiSuggestedComment: 'Recommended: Quantify "significantly outperformed" with specific data. Example: "outperformed the category average by X%" with Morningstar or Lipper data source.'
            }
        ],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-10T09:00:00', actor: 'agent', action: 'Initial Analysis', details: 'Found 2 items.' },
            { id: 'a2', timestamp: '2026-01-10T14:30:00', actor: 'analyst', action: 'Sent to Marketing', details: 'Requested comparative data.' },
            { id: 'a3', timestamp: '2026-01-12T14:00:00', actor: 'marketing', action: 'V2 Submitted', details: 'Added specific percentages.' }
        ]
    },
    '6': {
        id: '6',
        title: 'Fee Schedule 2026',
        type: 'XLSX',
        lastModified: 'Jan 8, 2026',
        complianceScore: 100,
        documentCategory: 'Fee Disclosure',
        matchedRegulation: 'SEC Form ADV Part 2A - Fee Disclosure',
        policyReference: 'POL-2024-005: Fee Disclosure Requirements',
        assignedPolicies: ['pol-005'],
        content: `FEE SCHEDULE 2026
Effective January 1, 2026
Document Version: 2.0

INTRODUCTION
This fee schedule outlines all costs associated with our investment advisory services. We are committed to transparency and ensuring you understand all fees before investing.

ADVISORY FEES (Annual, based on assets under management)
Tier 1: $0 - $500,000:         1.25%
Tier 2: $500,001 - $1,000,000: 1.00%
Tier 3: $1,000,001 - $5,000,000: 0.85%
Tier 4: $5,000,001+:           0.75%

Fee calculation: Fees are calculated quarterly based on the average daily balance and charged at quarter end.

TRADING COMMISSIONS
• Equities: $0 per trade
• Options: $0.65 per contract
• ETFs: $0 per trade
• Mutual Funds: $0 for no-load funds, sales load may apply to load funds
• Fixed Income: Markup/markdown included in price, typically 0.5-1.5%

ACCOUNT FEES
• Annual Maintenance: $0
• Wire Transfer (outgoing domestic): $25
• Wire Transfer (outgoing international): $50
• Account Closing Fee: $95
• Paper Statement Fee: $5/month
• Returned Check Fee: $30

IRA FEES
• Annual Custody Fee: $50 (waived for accounts over $25,000)
• Distribution Processing: $0
• Required Minimum Distribution: $0
• IRA Transfer Out: $95

ADDITIONAL SERVICES
• Financial Planning: Included with advisory relationship
• Estate Planning Coordination: Included
• Tax-Loss Harvesting: Included
• Custom Reporting: Included

IMPORTANT NOTES
• All fees are subject to change with 30 days written notice
• Fees may be negotiable based on account size and relationship
• Additional third-party fees (fund expenses, etc.) are not included above

Fee billing: All advisory fees are charged quarterly in arrears and debited from your account automatically.

For questions about fees, contact:
Client Services: 1-800-555-0123
Email: fees@firm.example.com`,
        versions: [
            { version: 1, content: `FEE SCHEDULE 2025...`, timestamp: '2025-01-08T10:00:00', author: 'analyst', status: 'approved' },
            {
                version: 2, content: `FEE SCHEDULE 2026...`, timestamp: '2026-01-08T10:00:00', author: 'analyst', status: 'approved', changes: [
                    { original: '2025', revised: '2026', lineNumber: 1, type: 'modification' },
                    { original: 'Effective January 1, 2025', revised: 'Effective January 1, 2026', lineNumber: 2, type: 'modification' },
                    { original: 'Document Version: 1.0', revised: 'Document Version: 2.0', lineNumber: 3, type: 'modification' },
                    { original: '$1,000,001+: 0.75%', revised: '$1,000,001 - $5,000,000: 0.85%', lineNumber: 10, type: 'modification' },
                    { original: '', revised: 'Tier 4: $5,000,001+: 0.75%', lineNumber: 11, type: 'addition' },
                    { original: 'IRA Transfer Out: $75', revised: 'IRA Transfer Out: $95', lineNumber: 28, type: 'modification' }
                ]
            }
        ],
        tasks: [],
        auditHistory: [
            { id: 'a1', timestamp: '2026-01-08T10:00:00', actor: 'agent', action: 'Initial Analysis', details: 'No issues found.' },
            { id: 'a2', timestamp: '2026-01-08T10:30:00', actor: 'analyst', action: 'Approved', details: 'Fee schedule approved.' },
            { id: 'a3', timestamp: '2026-01-08T11:00:00', actor: 'marketing', action: 'Published', details: 'Published to client portal.' }
        ]
    }
};

// Regulation database for auto-matching
export const regulationDatabase: Record<string, { name: string; summary: string; keyRequirements: string[] }> = {
    'Marketing Material': {
        name: 'SEC Regulation 12.3 - Investment Advertising',
        summary: 'Governs promotional materials for investment products',
        keyRequirements: ['No performance guarantees', 'Clear risk disclosure', 'Balanced presentation']
    },
    'Prospectus': {
        name: 'SEC Rule 156 - Investment Company Sales Literature',
        summary: 'Requirements for fund prospectuses and sales materials',
        keyRequirements: ['No misleading statements', 'Required disclaimers', 'Fair performance presentation']
    },
    'Internal Documentation': {
        name: 'FINRA Rule 2090 - Know Your Customer',
        summary: 'Internal procedures for client identification and suitability',
        keyRequirements: ['Client identification', 'Suitability assessment', 'Record keeping']
    },
    'Legal Disclosure': {
        name: 'SEC Advertising Rule - Track Record Claims',
        summary: 'Standards for performance and risk disclosures',
        keyRequirements: ['Accurate historical data', 'No misleading comparisons', 'Required warnings']
    },
    'Performance Report': {
        name: 'FINRA Rule 2210 - Comparative Advertising',
        summary: 'Standards for performance comparisons and benchmarking',
        keyRequirements: ['Substantiated claims', 'Fair comparisons', 'Data sources cited']
    },
    'Fee Disclosure': {
        name: 'SEC Form ADV Part 2A - Fee Disclosure',
        summary: 'Requirements for fee transparency',
        keyRequirements: ['All fees disclosed', 'Clear calculation methods', 'No hidden charges']
    }
};
