import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    AlertTriangle, CheckCircle, ChevronRight, ChevronDown, Lock, AlertCircle,
    CheckCircle2, ArrowLeft, Clock, GitBranch, Send, Plus, X, MessageSquare, Check
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { ComplianceTask, DecisionNode } from '@/app/data/document-data';

interface TaskListPanelProps {
    tasks: ComplianceTask[];
    selectedTaskId: number | null;
    onTaskSelect: (task: ComplianceTask | null) => void;
    overrideSubmittedTasks: Set<number>;
    onSubmitOverride: (taskId: number, justification: string) => void;
    taskComments: Record<number, string>;
    onSaveComment: (taskId: number, comment: string) => void;
    manualViolations: { id: number; text: string; description: string }[];
    onAddManualViolation: (text: string, description: string) => void;
    onRemoveManualViolation: (id: number) => void;
    onSendToMarketing: () => void;
    onApproveDocument: () => void;
}

// Decision Tree Component (minimized by default)
function DecisionTreeView({ tree }: { tree: DecisionNode }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getResultColor = (result: DecisionNode['result']) => {
        switch (result) {
            case 'pass': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'fail': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'flag': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        }
    };

    const renderNode = (node: DecisionNode, depth: number = 0) => (
        <div key={node.id} className={`${depth > 0 ? 'ml-4 mt-2' : ''}`}>
            <div className={`p-2 rounded border text-xs ${getResultColor(node.result)}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{node.regulation}</span>
                    <span className="text-[10px] opacity-75">{node.confidence}%</span>
                </div>
                <p className="opacity-75">{node.description}</p>
            </div>
            {node.children && (
                <div className="border-l border-gray-700 ml-2">
                    {node.children.map(child => renderNode(child, depth + 1))}
                </div>
            )}
        </div>
    );

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors w-full p-2 rounded bg-[#252525] hover:bg-[#2a2a2a]"
            >
                <GitBranch className="w-3 h-3" />
                <span>Decision Tree</span>
                {isExpanded ? (
                    <ChevronDown className="w-3 h-3 ml-auto" />
                ) : (
                    <ChevronRight className="w-3 h-3 ml-auto" />
                )}
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
                            {renderNode(tree)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Add Manual Violation Form
function AddViolationForm({
    onAdd,
    onCancel
}: {
    onAdd: (text: string, description: string) => void;
    onCancel: () => void;
}) {
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-[#1e1e1e] rounded-lg border border-gray-700 mb-4"
        >
            <h4 className="text-sm font-medium text-gray-200 mb-3">Add Manual Violation</h4>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Flagged text..."
                className="w-full mb-2 p-2 text-sm bg-[#252525] border border-gray-700 rounded text-gray-200 placeholder-gray-500"
            />
            <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the compliance issue..."
                className="mb-3 min-h-16 text-sm bg-[#252525] border-gray-700 text-gray-200"
            />
            <div className="flex gap-2">
                <Button
                    onClick={() => {
                        if (text && description) {
                            onAdd(text, description);
                            setText('');
                            setDescription('');
                        }
                    }}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!text || !description}
                >
                    Add Violation
                </Button>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300"
                >
                    Cancel
                </Button>
            </div>
        </motion.div>
    );
}

export function TaskListPanel({
    tasks,
    selectedTaskId,
    onTaskSelect,
    overrideSubmittedTasks,
    onSubmitOverride,
    taskComments,
    onSaveComment,
    manualViolations,
    onAddManualViolation,
    onRemoveManualViolation,
    onSendToMarketing,
    onApproveDocument
}: TaskListPanelProps) {
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [justification, setJustification] = useState('');
    const [showAddViolation, setShowAddViolation] = useState(false);
    const [editingComment, setEditingComment] = useState(false);
    const [commentText, setCommentText] = useState('');

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    // Separate active violations from overridden
    const activeViolations = tasks.filter(t => t.type !== 'compliant' && !overrideSubmittedTasks.has(t.id));
    const overriddenViolations = tasks.filter(t => t.type !== 'compliant' && overrideSubmittedTasks.has(t.id));
    const compliantItems = tasks.filter(t => t.type === 'compliant');

    // Issue counts
    const highCount = activeViolations.filter(t => t.type === 'high').length;
    const mediumCount = activeViolations.filter(t => t.type === 'medium').length;
    const overriddenCount = overriddenViolations.length;

    // Can approve if no active violations and no manual violations
    const canApprove = activeViolations.length === 0 && manualViolations.length === 0;
    const hasViolationsToSend = activeViolations.length > 0 || manualViolations.length > 0;

    const handleSubmitOverride = () => {
        if (selectedTask) {
            onSubmitOverride(selectedTask.id, justification);
            setShowOverrideForm(false);
            setJustification('');
        }
    };

    // Initialize comment with AI suggestion when selecting task
    useEffect(() => {
        if (selectedTask) {
            const existingComment = taskComments[selectedTask.id];
            setCommentText(existingComment || '');
            setEditingComment(false);
        }
    }, [selectedTaskId, taskComments]);

    const handleSaveComment = () => {
        if (selectedTask) {
            onSaveComment(selectedTask.id, commentText);
            setEditingComment(false);
        }
    };

    // Task List View
    if (!selectedTask) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full bg-[#191919] p-6 overflow-y-auto"
            >
                {/* Issues Summary */}
                <Card className="p-4 mb-6 bg-[#1e1e1e] border-gray-800">
                    <h3 className="text-xs tracking-wide text-gray-400 uppercase mb-3">Issue Summary</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-2xl font-semibold text-red-400">{highCount}</p>
                            <p className="text-xs text-gray-400">High</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-2xl font-semibold text-amber-400">{mediumCount}</p>
                            <p className="text-xs text-gray-400">Medium</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-2xl font-semibold text-blue-400">{overriddenCount}</p>
                            <p className="text-xs text-gray-400">Overridden</p>
                        </div>
                    </div>
                </Card>

                {/* Approve Document - Show if all violations addressed */}
                {canApprove && (
                    <Card className="p-4 mb-6 bg-green-500/10 border-green-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-green-400">Ready for Approval</p>
                                <p className="text-xs text-gray-400">All violations have been addressed</p>
                            </div>
                        </div>
                        <Button
                            onClick={onApproveDocument}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Approve Document
                        </Button>
                    </Card>
                )}

                {/* Send to Marketing - Show if there are violations to address */}
                {hasViolationsToSend && (
                    <Card className="p-4 mb-6 bg-orange-500/10 border-orange-500/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Send className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-medium text-orange-400">Send for Revision</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {activeViolations.length + manualViolations.length} items
                            </span>
                        </div>
                        <Button
                            onClick={onSendToMarketing}
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            Send to Marketing Team
                        </Button>
                    </Card>
                )}

                {/* Add Manual Violation */}
                {showAddViolation ? (
                    <AddViolationForm
                        onAdd={(text, description) => {
                            onAddManualViolation(text, description);
                            setShowAddViolation(false);
                        }}
                        onCancel={() => setShowAddViolation(false)}
                    />
                ) : (
                    <button
                        onClick={() => setShowAddViolation(true)}
                        className="w-full mb-6 p-3 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Manual Violation
                    </button>
                )}

                {/* Manual Violations */}
                {manualViolations.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs tracking-wide text-gray-400 uppercase mb-3">Analyst Flags</h3>
                        <div className="space-y-2">
                            {manualViolations.map((v) => (
                                <div
                                    key={v.id}
                                    className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-start justify-between"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm text-purple-400 font-medium">"{v.text}"</p>
                                        <p className="text-xs text-gray-400 mt-1">{v.description}</p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveManualViolation(v.id)}
                                        className="p-1 hover:bg-[#333] rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Violations */}
                {activeViolations.length > 0 && (
                    <>
                        <h3 className="text-sm tracking-wide text-gray-400 uppercase mb-4">Active Violations</h3>
                        <div className="space-y-3 mb-8">
                            {activeViolations.map((task, index) => {
                                const hasComment = !!taskComments[task.id];
                                const bgColor =
                                    task.type === 'high' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                                        'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';

                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => onTaskSelect(task)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${bgColor}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-xs text-gray-400">
                                                        {task.type === 'high' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
                                                    </p>
                                                    {hasComment && (
                                                        <MessageSquare className="w-3 h-3 text-blue-400" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-200 font-medium truncate">
                                                    "{task.text}"
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </div>
                                        {task.violation && (
                                            <p className="text-xs text-gray-400">{task.violation}</p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Overridden Violations */}
                {overriddenViolations.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm tracking-wide text-gray-400 uppercase">Overridden ({overriddenCount})</h3>
                        </div>
                        <div className="space-y-3 mb-8">
                            {overriddenViolations.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => onTaskSelect(task)}
                                    className="p-4 rounded-lg border cursor-pointer transition-all bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                <p className="text-xs text-blue-400 font-medium">OVERRIDDEN</p>
                                            </div>
                                            <p className="text-sm text-gray-200 font-medium truncate">
                                                "{task.text}"
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Compliant Items */}
                {compliantItems.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <h3 className="text-sm tracking-wide text-gray-400 uppercase">Compliant</h3>
                        </div>
                        <div className="space-y-3">
                            {compliantItems.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => onTaskSelect(task)}
                                    className="p-4 rounded-lg border cursor-pointer transition-all bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs text-green-400 mb-1">COMPLIANT</p>
                                            <p className="text-sm text-gray-200 font-medium truncate">"{task.text}"</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        );
    }

    // Task Detail View
    const isOverrideSubmitted = overrideSubmittedTasks.has(selectedTask.id);
    const existingComment = taskComments[selectedTask.id];
    const aiSuggestion = selectedTask.aiSuggestedComment || '';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full bg-[#191919] p-6 overflow-y-auto"
        >
            {/* Back Button */}
            <button
                onClick={() => onTaskSelect(null)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Tasks
            </button>

            {/* Override Submitted State */}
            {isOverrideSubmitted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        <div>
                            <h4 className="font-semibold text-sm text-blue-400">Override Applied</h4>
                            <p className="text-xs text-gray-400 mt-1">
                                This violation has been overridden and will not be sent to marketing.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Violation Card */}
            <motion.div
                layout
                className={`mb-6 p-5 rounded-lg border-2 transition-all ${isOverrideSubmitted ? 'bg-blue-500/10 border-blue-500/30' :
                        selectedTask.type === 'high'
                            ? 'bg-red-500/10 border-red-500/30'
                            : selectedTask.type === 'medium'
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-green-500/10 border-green-500/30'
                    }`}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        {selectedTask.violation && (
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Violation Detected</p>
                        )}
                        <h4 className={`font-semibold text-base mb-1 ${isOverrideSubmitted ? 'text-blue-400' :
                                selectedTask.type === 'high' ? 'text-red-400' :
                                    selectedTask.type === 'medium' ? 'text-amber-400' :
                                        'text-green-400'
                            }`}>
                            {selectedTask.violation || 'Verified Compliant'}
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
                            Selected Text: "{selectedTask.text}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Confidence:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-[#252525] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedTask.confidence}%` }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`h-full ${isOverrideSubmitted ? 'bg-blue-500' :
                                            selectedTask.type === 'high'
                                                ? 'bg-red-500'
                                                : selectedTask.type === 'medium'
                                                    ? 'bg-amber-500'
                                                    : 'bg-green-500'
                                        }`}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-200">{selectedTask.confidence}%</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Decision Tree (minimized by default) */}
            <DecisionTreeView tree={selectedTask.decisionTree} />

            {/* Reasoning Explanation */}
            <Card className="mb-6 p-5 bg-[#1e1e1e] border-gray-800">
                <h4 className="font-medium text-sm text-gray-200 mb-4">Agent Reasoning</h4>
                <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {selectedTask.reasoning?.split('\n\n').map((paragraph, i) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                return (
                                    <p key={i} className="font-semibold text-gray-200 mt-4 mb-2">
                                        {paragraph.replace(/\*\*/g, '')}
                                    </p>
                                );
                            }
                            if (paragraph.startsWith('**')) {
                                const parts = paragraph.split('**');
                                return (
                                    <p key={i} className="mt-4">
                                        <span className="font-semibold text-gray-200">{parts[1]}</span>
                                        {parts[2]}
                                    </p>
                                );
                            }
                            return <p key={i} className="mt-2">{paragraph}</p>;
                        })}
                    </div>
                </div>
            </Card>

            {/* Comment Section */}
            <Card className="mb-6 p-4 bg-[#1e1e1e] border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <h4 className="font-medium text-sm text-gray-200">Your Comment</h4>
                    </div>
                    {existingComment && !editingComment && (
                        <button
                            onClick={() => {
                                setCommentText(existingComment);
                                setEditingComment(true);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {editingComment || !existingComment ? (
                    <div className="space-y-3">
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={aiSuggestion}
                            className="min-h-20 text-sm bg-[#252525] border-gray-700 text-gray-200 placeholder-gray-500"
                        />
                        {!commentText && aiSuggestion && (
                            <p className="text-xs text-gray-500 italic">{aiSuggestion}</p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    if (!commentText && aiSuggestion) {
                                        setCommentText(aiSuggestion);
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                className="border-gray-700 text-gray-300"
                                disabled={!!commentText}
                            >
                                Use AI Suggestion
                            </Button>
                            <Button
                                onClick={handleSaveComment}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={!commentText}
                            >
                                Save Comment
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-300">{existingComment}</p>
                )}
            </Card>

            {/* Override Action - For high/medium violations that haven't been submitted */}
            {(selectedTask.type === 'high' || selectedTask.type === 'medium') && !isOverrideSubmitted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {!showOverrideForm ? (
                        <Card className="p-4 border-2 border-gray-700 bg-[#1e1e1e]">
                            <div className="flex items-start gap-3 mb-3">
                                <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm mb-1 text-gray-200">
                                        Override This Violation?
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        If this violation can be safely ignored, provide justification for the audit trail.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowOverrideForm(true)}
                                variant="outline"
                                className="w-full border-gray-700 text-gray-300 hover:bg-[#252525]"
                                size="sm"
                            >
                                Request Override
                            </Button>
                        </Card>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`border-2 rounded-lg p-4 ${selectedTask.type === 'high'
                                    ? 'border-red-500/30 bg-red-500/10'
                                    : 'border-amber-500/30 bg-amber-500/10'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className={`w-5 h-5 ${selectedTask.type === 'high' ? 'text-red-400' : 'text-amber-400'
                                    }`} />
                                <h4 className={`font-semibold text-sm ${selectedTask.type === 'high' ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                    Override Justification Required
                                </h4>
                            </div>
                            <p className="text-xs text-gray-300 mb-3">
                                Explain why this {selectedTask.confidence}% confidence flag can be safely ignored.
                            </p>
                            <Textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Enter justification for audit trail..."
                                className="mb-3 min-h-24 text-sm bg-[#1e1e1e] border-gray-700 text-gray-200"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSubmitOverride}
                                    size="sm"
                                    className={`flex-1 ${selectedTask.type === 'high'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-amber-600 hover:bg-amber-700'
                                        }`}
                                    disabled={justification.length < 10}
                                >
                                    Submit Override
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowOverrideForm(false);
                                        setJustification('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-700 text-gray-300 hover:bg-[#2a2a2a]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Compliant Indicator */}
            {selectedTask.type === 'compliant' && (
                <Card className="p-4 border-2 border-green-500/30 bg-green-500/10">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-1 text-green-400">Verified Compliant</h4>
                            <p className="text-xs text-gray-300">
                                This text has been verified as compliant with all applicable regulations.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </motion.div>
    );
}
