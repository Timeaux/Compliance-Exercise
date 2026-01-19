import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Bot, User, Megaphone, Clock, GitBranch, Check, AlertCircle } from 'lucide-react';
import { AuditEntry, DocumentVersion } from '@/app/data/document-data';

interface AuditHistoryPanelProps {
    entries: AuditEntry[];
    versions: DocumentVersion[];
    onViewDiff: (versionIndex: number) => void;
    onAddEntry?: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
}

export function AuditHistoryPanel({ entries, versions, onViewDiff }: AuditHistoryPanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const getActorIcon = (actor: AuditEntry['actor']) => {
        switch (actor) {
            case 'agent':
                return <Bot className="w-4 h-4" />;
            case 'analyst':
                return <User className="w-4 h-4" />;
            case 'marketing':
                return <Megaphone className="w-4 h-4" />;
        }
    };

    const getActorColor = (actor: AuditEntry['actor']) => {
        switch (actor) {
            case 'agent':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'analyst':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'marketing':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        }
    };

    const getActorLabel = (actor: AuditEntry['actor']) => {
        switch (actor) {
            case 'agent':
                return 'AI Agent';
            case 'analyst':
                return 'Analyst';
            case 'marketing':
                return 'Marketing';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Check if latest version is approved
    const latestVersion = versions[versions.length - 1];
    const isLatestApproved = entries.some(e =>
        e.action === 'Changes Approved' || e.action === 'Approved' || e.action === 'Review Approved'
    );

    return (
        <>
            {/* Collapsed Toggle Button */}
            <AnimatePresence>
                {isCollapsed && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setIsCollapsed(false)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-24 bg-[#2a2a2a] rounded-r-lg shadow-lg flex flex-col items-center justify-center gap-2 hover:bg-[#333] transition-colors border border-l-0 border-gray-700"
                    >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Expanded Panel */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-[#1a1a1a] border-r border-gray-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <h3 className="text-sm font-medium text-gray-200">Document History</h3>
                            </div>
                            <button
                                onClick={() => setIsCollapsed(true)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#333] transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Versions Section */}
                        {versions.length > 0 && (
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <GitBranch className="w-4 h-4 text-gray-400" />
                                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Versions</h4>
                                </div>
                                <div className="space-y-2">
                                    {versions.map((version, index) => {
                                        const isLatest = index === versions.length - 1;
                                        const isPending = isLatest && !isLatestApproved && version.author === 'marketing';

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => index > 0 && onViewDiff(index)}
                                                disabled={index === 0}
                                                className={`w-full p-3 rounded-lg text-left transition-all ${isPending
                                                        ? 'bg-amber-500/10 border-2 border-amber-500/50 hover:bg-amber-500/20'
                                                        : index === 0
                                                            ? 'bg-[#252525] border border-gray-800 opacity-60 cursor-default'
                                                            : 'bg-[#252525] border border-gray-800 hover:bg-[#2a2a2a] hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${isPending ? 'text-amber-400' : 'text-gray-200'}`}>
                                                            V{version.version}
                                                        </span>
                                                        {isPending && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded">
                                                                PENDING REVIEW
                                                            </span>
                                                        )}
                                                        {isLatest && isLatestApproved && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                                                                <Check className="w-3 h-3" />
                                                                APPROVED
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        by {version.author === 'marketing' ? 'Marketing' : 'Analyst'}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {formatTimestamp(version.timestamp)}
                                                    </span>
                                                </div>
                                                {index > 0 && version.changes && version.changes.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {version.changes.length} change{version.changes.length > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Activity</h4>
                            </div>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-700" />

                                {/* Entries */}
                                <div className="space-y-4">
                                    {entries.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative pl-8"
                                        >
                                            {/* Timeline dot */}
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${getActorColor(entry.actor)}`}>
                                                {getActorIcon(entry.actor)}
                                            </div>

                                            {/* Entry content */}
                                            <div className="bg-[#222] rounded-lg p-3 border border-gray-800">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-medium ${getActorColor(entry.actor).split(' ')[1]}`}>
                                                        {getActorLabel(entry.actor)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimestamp(entry.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-200 mb-1">{entry.action}</p>
                                                <p className="text-xs text-gray-400">{entry.details}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-3 border-t border-gray-800 flex-shrink-0">
                            <div className="flex items-center justify-around text-xs">
                                <div className="flex items-center gap-1 text-purple-400">
                                    <Bot className="w-3 h-3" />
                                    <span>AI</span>
                                </div>
                                <div className="flex items-center gap-1 text-blue-400">
                                    <User className="w-3 h-3" />
                                    <span>Analyst</span>
                                </div>
                                <div className="flex items-center gap-1 text-orange-400">
                                    <Megaphone className="w-3 h-3" />
                                    <span>Marketing</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
