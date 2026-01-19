import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Send, AlertTriangle, CheckCircle2, Edit3, Bot, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { ComplianceTask } from '@/app/data/document-data';

interface ManualViolation {
    id: number;
    text: string;
    description: string;
}

interface HandoffModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
    tasks: ComplianceTask[];
    overriddenTaskIds: Set<number>;
    taskComments: Record<number, string>;
    manualViolations: ManualViolation[];
    onSend: () => void;
}

interface HandoffItem {
    id: string;
    source: 'ai' | 'analyst';
    title: string;
    violation?: string;
    severity: 'high' | 'medium';
    instruction: string;
    aiSuggestion: string;
    isOverridden?: boolean;
}

export function HandoffModal({
    isOpen,
    onClose,
    documentTitle,
    tasks,
    overriddenTaskIds,
    taskComments,
    manualViolations,
    onSend
}: HandoffModalProps) {
    const [items, setItems] = useState<HandoffItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Recalculate items whenever modal opens or data changes
    useEffect(() => {
        if (isOpen) {
            // Get all non-compliant, non-overridden tasks
            const activeTasks = tasks.filter(t =>
                t.type !== 'compliant' && !overriddenTaskIds.has(t.id)
            );

            const newItems: HandoffItem[] = [
                ...activeTasks.map(task => ({
                    id: `task-${task.id}`,
                    source: 'ai' as const,
                    title: task.text,
                    violation: task.violation,
                    severity: task.type as 'high' | 'medium',
                    instruction: taskComments[task.id] || '',
                    aiSuggestion: task.aiSuggestedComment || `This ${task.type === 'high' ? 'critical' : 'moderate'} issue needs to be addressed: ${task.violation || task.text}`
                })),
                ...manualViolations.map(v => ({
                    id: `manual-${v.id}`,
                    source: 'analyst' as const,
                    title: v.text,
                    violation: v.description,
                    severity: 'high' as const,
                    instruction: '',
                    aiSuggestion: `Manual flag: "${v.text}" - ${v.description}. Please revise this section according to compliance guidelines.`
                }))
            ];

            setItems(newItems);
            setEditingId(null);
        }
    }, [isOpen, tasks, overriddenTaskIds, taskComments, manualViolations]);

    const updateInstruction = (id: string, instruction: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, instruction } : item
        ));
    };

    const useAiSuggestion = (id: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            updateInstruction(id, item.aiSuggestion);
        }
    };

    const highPriorityItems = items.filter(item => item.severity === 'high');
    const mediumPriorityItems = items.filter(item => item.severity === 'medium');

    // Get overridden tasks for display
    const overriddenTasks = useMemo(() =>
        tasks.filter(t => overriddenTaskIds.has(t.id)),
        [tasks, overriddenTaskIds]
    );

    if (!isOpen) return null;

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
                className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Send to Marketing</h2>
                        <p className="text-sm text-gray-400 mt-1">{documentTitle} • {items.length} items to address</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* High Priority Section */}
                    {highPriorityItems.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide">
                                    Critical Issues ({highPriorityItems.length})
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {highPriorityItems.map((item) => (
                                    <HandoffItemCard
                                        key={item.id}
                                        item={item}
                                        isEditing={editingId === item.id}
                                        onEdit={() => setEditingId(item.id)}
                                        onSave={() => setEditingId(null)}
                                        onUpdateInstruction={(instruction) => updateInstruction(item.id, instruction)}
                                        onUseAiSuggestion={() => useAiSuggestion(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medium Priority Section */}
                    {mediumPriorityItems.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wide">
                                    Recommended Changes ({mediumPriorityItems.length})
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {mediumPriorityItems.map((item) => (
                                    <HandoffItemCard
                                        key={item.id}
                                        item={item}
                                        isEditing={editingId === item.id}
                                        onEdit={() => setEditingId(item.id)}
                                        onSave={() => setEditingId(null)}
                                        onUpdateInstruction={(instruction) => updateInstruction(item.id, instruction)}
                                        onUseAiSuggestion={() => useAiSuggestion(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overridden Section */}
                    {overriddenTasks.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wide">
                                    Overridden ({overriddenTasks.length})
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {overriddenTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 opacity-60"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm text-gray-300">"{task.text}"</span>
                                            <span className="text-xs text-blue-400 ml-auto">Not included</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {items.length === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <p className="text-gray-300 font-medium">No violations to send</p>
                            <p className="text-sm text-gray-500 mt-1">All items have been overridden or resolved</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-[#1a1a1a] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-400">
                            <span className="text-gray-200 font-medium">{items.filter(i => i.instruction).length}</span> of {items.length} items have instructions
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            onSend();
                            onClose();
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={items.length === 0}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Marketing Team
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

interface HandoffItemCardProps {
    item: HandoffItem;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onUpdateInstruction: (instruction: string) => void;
    onUseAiSuggestion: () => void;
}

function HandoffItemCard({
    item,
    isEditing,
    onEdit,
    onSave,
    onUpdateInstruction,
    onUseAiSuggestion
}: HandoffItemCardProps) {
    const borderColor = item.severity === 'high' ? 'border-red-500/30' : 'border-amber-500/30';
    const bgColor = item.severity === 'high' ? 'bg-red-500/5' : 'bg-amber-500/5';

    return (
        <div className={`rounded-lg border ${borderColor} ${bgColor} overflow-hidden`}>
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {item.source === 'ai' ? (
                            <Bot className="w-4 h-4 text-purple-400" />
                        ) : (
                            <User className="w-4 h-4 text-blue-400" />
                        )}
                        <span className={`text-xs ${item.source === 'ai' ? 'text-purple-400' : 'text-blue-400'}`}>
                            {item.source === 'ai' ? 'AI Detected' : 'Analyst Flagged'}
                        </span>
                    </div>
                    {item.instruction && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                </div>
                <p className="font-medium text-gray-200 mb-1">"{item.title}"</p>
                {item.violation && (
                    <p className="text-xs text-gray-400">{item.violation}</p>
                )}
            </div>

            {/* Instruction Area */}
            <div className="border-t border-gray-800 p-4 bg-[#1a1a1a]">
                {isEditing ? (
                    <div className="space-y-3">
                        <Textarea
                            value={item.instruction}
                            onChange={(e) => onUpdateInstruction(e.target.value)}
                            placeholder="Enter instructions for marketing team..."
                            className="min-h-20 text-sm bg-[#252525] border-gray-700 text-gray-200"
                        />
                        <div className="flex items-center justify-between">
                            <button
                                onClick={onUseAiSuggestion}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                <Bot className="w-3 h-3" />
                                Use AI suggestion
                            </button>
                            <Button onClick={onSave} size="sm">
                                Save
                            </Button>
                        </div>
                    </div>
                ) : item.instruction ? (
                    <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-300 flex-1">{item.instruction}</p>
                        <button
                            onClick={onEdit}
                            className="ml-2 p-1.5 rounded hover:bg-[#333] transition-colors"
                        >
                            <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* AI Suggestion - Light grey, overwritable */}
                        <div
                            onClick={onEdit}
                            className="text-sm text-gray-500 italic cursor-pointer hover:text-gray-400 transition-colors"
                        >
                            {item.aiSuggestion}
                        </div>
                        <button
                            onClick={onEdit}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                            <Edit3 className="w-3 h-3" />
                            Click to edit or use suggestion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
