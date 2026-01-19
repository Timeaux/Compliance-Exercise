import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Check, ArrowLeft, ArrowRight, XCircle, Send, MessageSquare, Edit3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { DocumentVersion } from '@/app/data/document-data';

interface DiffViewProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
    versions: DocumentVersion[];
    onApprove: () => void;
    onDecline?: (feedback: string) => void;
    onEditDocument?: () => void;
}

export function DiffView({ isOpen, onClose, documentTitle, versions, onApprove, onDecline, onEditDocument }: DiffViewProps) {
    const [selectedV1, setSelectedV1] = useState(0);
    const [selectedV2, setSelectedV2] = useState(1);
    const [showDropdown, setShowDropdown] = useState<'v1' | 'v2' | null>(null);
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineFeedback, setDeclineFeedback] = useState('');

    // Reset selections when versions change or modal opens
    useEffect(() => {
        if (isOpen && versions.length >= 2) {
            setSelectedV1(0);
            setSelectedV2(versions.length - 1);
            setShowDeclineForm(false);
            setDeclineFeedback('');
        }
    }, [isOpen, versions.length]);

    if (!isOpen || versions.length < 2) return null;

    const v1 = versions[selectedV1];
    const v2 = versions[selectedV2];

    // Safety check
    if (!v1 || !v2) return null;

    const changes = v2.changes || [];

    const handleDecline = () => {
        if (onDecline && declineFeedback.trim()) {
            onDecline(declineFeedback);
            onClose();
        }
    };

    // Simple diff visualization
    const renderDiffContent = () => {
        const v2Lines = v2.content.split('\n');

        return v2Lines.map((line, index) => {
            const lineNum = index + 1;
            const change = changes.find(c => c.lineNumber === lineNum);

            if (change) {
                // This line has a change
                return (
                    <div key={index} className="group">
                        {/* Deleted line */}
                        <div className="flex items-start gap-3 px-4 py-1 bg-red-500/10 border-l-2 border-red-500">
                            <span className="text-xs text-red-400 w-8 flex-shrink-0 text-right opacity-50">−</span>
                            <span className="text-sm text-red-400 line-through opacity-75">{change.original}</span>
                        </div>
                        {/* Added line */}
                        <div className="flex items-start gap-3 px-4 py-1 bg-green-500/10 border-l-2 border-green-500">
                            <span className="text-xs text-green-400 w-8 flex-shrink-0 text-right opacity-50">+</span>
                            <span className="text-sm text-green-400">{change.revised}</span>
                        </div>
                    </div>
                );
            }

            // Unchanged line - grayed out
            return (
                <div key={index} className="flex items-start gap-3 px-4 py-0.5 opacity-40">
                    <span className="text-xs text-gray-600 w-8 flex-shrink-0 text-right">{lineNum}</span>
                    <span className="text-sm text-gray-500">{line || ' '}</span>
                </div>
            );
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Compare Versions</h2>
                        <p className="text-sm text-gray-400 mt-1">{documentTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Version Selector */}
                <div className="flex items-center justify-center gap-4 p-4 border-b border-gray-800 bg-[#1a1a1a]">
                    {/* V1 Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(showDropdown === 'v1' ? null : 'v1')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <span className="text-sm text-gray-200">V{v1.version}</span>
                            <span className="text-xs text-gray-500">({new Date(v1.timestamp).toLocaleDateString()})</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showDropdown === 'v1' && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#252525] border border-gray-700 rounded-lg shadow-xl z-10">
                                {versions.slice(0, -1).map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedV1(i);
                                            setShowDropdown(null);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[#333] transition-colors ${selectedV1 === i ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'
                                            }`}
                                    >
                                        V{v.version} - {new Date(v.timestamp).toLocaleDateString()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-500" />

                    {/* V2 Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(showDropdown === 'v2' ? null : 'v2')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#252525] border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <span className="text-sm text-gray-200">V{v2.version}</span>
                            <span className="text-xs text-gray-500">({new Date(v2.timestamp).toLocaleDateString()})</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showDropdown === 'v2' && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#252525] border border-gray-700 rounded-lg shadow-xl z-10">
                                {versions.slice(1).map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedV2(i + 1);
                                            setShowDropdown(null);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[#333] transition-colors ${selectedV2 === i + 1 ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'
                                            }`}
                                    >
                                        V{v.version} - {new Date(v.timestamp).toLocaleDateString()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Summary */}
                <div className="px-6 py-3 bg-[#1a1a1a] border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span className="text-xs text-gray-400">{changes.length} additions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            <span className="text-xs text-gray-400">{changes.length} deletions</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Submitted by {v2.author} • {new Date(v2.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Diff Content */}
                <div className="flex-1 overflow-y-auto bg-[#191919] font-mono">
                    {changes.length > 0 ? (
                        <div className="py-4">
                            {renderDiffContent()}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400">No tracked changes between these versions</p>
                            <p className="text-sm text-gray-500 mt-1">Full comparison requires line-by-line analysis</p>
                        </div>
                    )}
                </div>

                {/* Decline Feedback Form */}
                <AnimatePresence>
                    {showDeclineForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-800 bg-[#1a1a1a] overflow-hidden"
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-red-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-sm font-medium">Feedback for Marketing</span>
                                </div>
                                <Textarea
                                    value={declineFeedback}
                                    onChange={(e) => setDeclineFeedback(e.target.value)}
                                    placeholder="Explain what needs to be changed and why these revisions are not acceptable..."
                                    className="min-h-24 bg-[#252525] border-gray-700 text-gray-200"
                                />
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setShowDeclineForm(false)}
                                        className="text-sm text-gray-400 hover:text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        onClick={handleDecline}
                                        disabled={!declineFeedback.trim()}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Back for Revision
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-[#1a1a1a] flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-700 text-gray-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Review
                        </Button>

                        <div className="flex items-center gap-3">
                            {onEditDocument && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onEditDocument();
                                        onClose();
                                    }}
                                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit in V1 Interface
                                </Button>
                            )}
                            {!showDeclineForm && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeclineForm(true)}
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Request Changes
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    onApprove();
                                    onClose();
                                }}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Approve Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
