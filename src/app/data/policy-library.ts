// Policy documents that can be applied to uploaded documents
// Each policy contains rules that match against document content

export interface PolicyDocument {
    id: string;
    code: string;
    name: string;
    category: string;
    description: string;
    version: string;
    lastUpdated: string;
    documentTypes: string[];
    keywords: string[];
    rules: PolicyRule[];
}

export interface PolicyRule {
    id: string;
    name: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    prohibitedPatterns: string[];
    requiredElements: string[];
}

export const policyLibrary: PolicyDocument[] = [
    {
        id: 'pol-001',
        code: 'POL-2024-001',
        name: 'Marketing Communications Standards',
        category: 'Marketing',
        description: 'Standards for all marketing materials including advertisements, brochures, and digital content. Prohibits misleading performance claims and requires balanced presentation.',
        version: '3.2',
        lastUpdated: '2026-01-01',
        documentTypes: ['Marketing Material', 'Advertisement', 'Brochure'],
        keywords: ['marketing', 'flyer', 'advertisement', 'promotion', 'campaign'],
        rules: [
            {
                id: 'r1',
                name: 'No Performance Guarantees',
                severity: 'high',
                description: 'Prohibits use of "guaranteed", "certain", or similar language implying investment certainty',
                prohibitedPatterns: ['guaranteed returns', 'certain gains', 'risk-free', 'no-loss'],
                requiredElements: []
            },
            {
                id: 'r2',
                name: 'Urgency Language Restrictions',
                severity: 'medium',
                description: 'Restricts artificial urgency that pressures investor decisions',
                prohibitedPatterns: ['limited time', 'act now', 'dont miss out', 'expires soon'],
                requiredElements: []
            },
            {
                id: 'r3',
                name: 'Required Disclosure',
                severity: 'high',
                description: 'All marketing materials must include terms disclosure',
                prohibitedPatterns: [],
                requiredElements: ['Terms and conditions apply', 'See full disclosure']
            }
        ]
    },
    {
        id: 'pol-002',
        code: 'POL-2024-002',
        name: 'Fund Prospectus Requirements',
        category: 'Legal',
        description: 'Requirements for investment fund prospectuses including risk disclosures, fee transparency, and performance presentation standards.',
        version: '2.1',
        lastUpdated: '2025-11-15',
        documentTypes: ['Prospectus', 'Fund Overview', 'Investment Summary'],
        keywords: ['prospectus', 'fund', 'investment', 'offering'],
        rules: [
            {
                id: 'r1',
                name: 'Risk Disclosure Requirements',
                severity: 'high',
                description: 'Must include comprehensive risk disclosure section',
                prohibitedPatterns: ['risk-free', 'safe investment', 'no downside'],
                requiredElements: ['Principal loss risk', 'Market volatility disclosure']
            },
            {
                id: 'r2',
                name: 'Performance Disclaimer',
                severity: 'high',
                description: 'Must include standard performance disclaimer',
                prohibitedPatterns: ['past performance guarantees', 'will continue'],
                requiredElements: ['Past performance is not indicative of future results']
            }
        ]
    },
    {
        id: 'pol-003',
        code: 'POL-2024-003',
        name: 'Client Communication Guidelines',
        category: 'Operations',
        description: 'Guidelines for all client-facing communications including emails, letters, and digital messages. Ensures professional tone and compliance.',
        version: '1.8',
        lastUpdated: '2025-12-01',
        documentTypes: ['Email Template', 'Letter', 'Client Guide', 'Onboarding'],
        keywords: ['client', 'customer', 'onboarding', 'welcome', 'communication'],
        rules: [
            {
                id: 'r1',
                name: 'Professional Language',
                severity: 'low',
                description: 'Communications should maintain professional tone',
                prohibitedPatterns: [],
                requiredElements: []
            },
            {
                id: 'r2',
                name: 'KYC Reference',
                severity: 'medium',
                description: 'Onboarding materials must reference KYC requirements',
                prohibitedPatterns: [],
                requiredElements: ['Know Your Customer', 'identity verification']
            }
        ]
    },
    {
        id: 'pol-004',
        code: 'POL-2024-004',
        name: 'Performance Reporting Standards',
        category: 'Reporting',
        description: 'Standards for quarterly and annual performance reports. Requires substantiated comparisons and proper benchmark citations.',
        version: '2.4',
        lastUpdated: '2026-01-10',
        documentTypes: ['Performance Report', 'Quarterly Report', 'Annual Report'],
        keywords: ['performance', 'report', 'quarterly', 'annual', 'results'],
        rules: [
            {
                id: 'r1',
                name: 'Benchmark Requirements',
                severity: 'high',
                description: 'Performance claims must include benchmark comparisons',
                prohibitedPatterns: ['outperformed all', 'best in market'],
                requiredElements: ['vs benchmark', 'compared to']
            },
            {
                id: 'r2',
                name: 'Source Citations',
                severity: 'medium',
                description: 'All performance data must cite sources',
                prohibitedPatterns: [],
                requiredElements: ['Source:', 'Data from']
            }
        ]
    },
    {
        id: 'pol-005',
        code: 'POL-2024-005',
        name: 'Fee Disclosure Requirements',
        category: 'Legal',
        description: 'Requirements for fee schedules and expense disclosures. Ensures all fees are clearly presented with no hidden charges.',
        version: '1.5',
        lastUpdated: '2025-10-01',
        documentTypes: ['Fee Schedule', 'Expense Disclosure', 'Pricing'],
        keywords: ['fee', 'pricing', 'cost', 'expense', 'schedule'],
        rules: [
            {
                id: 'r1',
                name: 'Complete Fee Listing',
                severity: 'high',
                description: 'All applicable fees must be listed',
                prohibitedPatterns: ['hidden fees apply', 'additional charges may apply'],
                requiredElements: ['Management Fee', 'Transaction costs']
            }
        ]
    },
    {
        id: 'pol-006',
        code: 'POL-2024-006',
        name: 'Risk Disclosure Standards',
        category: 'Legal',
        description: 'Standards for risk disclosure documents including language requirements, formatting, and required warnings.',
        version: '3.0',
        lastUpdated: '2025-09-15',
        documentTypes: ['Risk Disclosure', 'Warning Statement', 'Disclaimer'],
        keywords: ['risk', 'disclosure', 'warning', 'disclaimer'],
        rules: [
            {
                id: 'r1',
                name: 'No Safety Implications',
                severity: 'high',
                description: 'Risk documents cannot imply safety or guaranteed protection',
                prohibitedPatterns: ['safe haven', 'protected investment', 'guaranteed principal'],
                requiredElements: []
            },
            {
                id: 'r2',
                name: 'Loss Acknowledgment',
                severity: 'high',
                description: 'Must include loss possibility acknowledgment',
                prohibitedPatterns: [],
                requiredElements: ['possible loss of principal', 'may lose value']
            }
        ]
    }
];

// Helper to find matching policies for a document
export function findMatchingPolicies(documentCategory: string, documentName: string): PolicyDocument[] {
    const lowerName = documentName.toLowerCase();

    return policyLibrary.filter(policy => {
        // Check if document type matches
        const typeMatch = policy.documentTypes.some(type =>
            documentCategory.toLowerCase().includes(type.toLowerCase()) ||
            type.toLowerCase().includes(documentCategory.toLowerCase())
        );

        // Check if any keywords match
        const keywordMatch = policy.keywords.some(keyword =>
            lowerName.includes(keyword)
        );

        return typeMatch || keywordMatch;
    });
}
