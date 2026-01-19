import { CheckCircle, FileText, AlertTriangle, GitBranch } from 'lucide-react';
import { motion } from 'motion/react';
import { documents } from '@/app/data/document-data';

interface DocumentGridProps {
    onSelectDocument: (docId: string) => void;
}

function DocumentCard({ docId, onClick }: { docId: string; onClick: () => void }) {
    const doc = documents[docId];
    if (!doc) return null;

    const highCount = doc.tasks.filter(t => t.type === 'high').length;
    const mediumCount = doc.tasks.filter(t => t.type === 'medium').length;
    const versionCount = doc.versions.length;

    const scoreColor = doc.complianceScore >= 90 ? 'text-green-400' :
        doc.complianceScore >= 70 ? 'text-amber-400' : 'text-red-400';
    const progressColor = doc.complianceScore >= 90 ? 'bg-green-500' :
        doc.complianceScore >= 70 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-600 transition-colors"
        >
            {/* Document Icon & Title */}
            <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center relative ${doc.type === 'PDF' ? 'bg-red-500/20' :
                        doc.type === 'DOCX' ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                    <FileText className={`w-6 h-6 ${doc.type === 'PDF' ? 'text-red-400' :
                            doc.type === 'DOCX' ? 'text-blue-400' : 'text-green-400'
                        }`} />
                    {/* Version badge */}
                    {versionCount > 1 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">V{versionCount}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-200 truncate">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{doc.type} • {doc.lastModified}</p>
                </div>
            </div>

            {/* Compliance Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Compliance Score</span>
                    <span className={`text-lg font-semibold ${scoreColor}`}>{doc.complianceScore}%</span>
                </div>
                <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${doc.complianceScore}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full ${progressColor}`}
                    />
                </div>
            </div>

            {/* Issue Summary */}
            <div className="flex items-center gap-3 text-xs">
                {highCount > 0 && (
                    <div className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{highCount} High</span>
                    </div>
                )}
                {mediumCount > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{mediumCount} Medium</span>
                    </div>
                )}
                {highCount === 0 && mediumCount === 0 && (
                    <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>All Clear</span>
                    </div>
                )}
                {versionCount > 1 && (
                    <div className="flex items-center gap-1 text-purple-400 ml-auto">
                        <GitBranch className="w-3 h-3" />
                        <span>{versionCount} versions</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function DocumentGrid({ onSelectDocument }: DocumentGridProps) {
    const docIds = Object.keys(documents);

    return (
        <div className="h-full bg-[#191919] overflow-y-auto">
            {/* Header */}
            <div className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-2">My Documents</h2>
                <p className="text-sm text-gray-400 mb-8">Select a document to review compliance analysis</p>

                {/* Document Grid */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm tracking-wide text-gray-400 uppercase">All Documents</h3>
                    <span className="text-sm text-gray-500">{docIds.length} documents</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {docIds.map((docId, index) => (
                        <motion.div
                            key={docId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <DocumentCard
                                docId={docId}
                                onClick={() => onSelectDocument(docId)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
