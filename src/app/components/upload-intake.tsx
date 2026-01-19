import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Check, ArrowRight, X, Shield, BookOpen, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { regulationDatabase } from '@/app/data/document-data';
import { policyLibrary, PolicyDocument } from '@/app/data/policy-library';

interface UploadIntakeProps {
    isOpen: boolean;
    onClose: () => void;
    onStartReview: (docId: string) => void;
}

interface DetectedDocument {
    name: string;
    type: string;
    category: string;
    regulation: { name: string; summary: string; keyRequirements: string[] };
}

export function UploadIntake({ isOpen, onClose, onStartReview }: UploadIntakeProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedDoc, setDetectedDoc] = useState<DetectedDocument | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'policies'>('upload');
    const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
    const [showPolicyPicker, setShowPolicyPicker] = useState(false);

    const detectDocumentType = (fileName: string): DetectedDocument => {
        const lowerName = fileName.toLowerCase();

        let category = 'Marketing Material';
        if (lowerName.includes('prospectus')) category = 'Prospectus';
        else if (lowerName.includes('onboarding') || lowerName.includes('guide')) category = 'Internal Documentation';
        else if (lowerName.includes('risk') || lowerName.includes('disclosure')) category = 'Legal Disclosure';
        else if (lowerName.includes('performance') || lowerName.includes('report')) category = 'Performance Report';
        else if (lowerName.includes('fee')) category = 'Fee Disclosure';

        const regulation = regulationDatabase[category];

        // Auto-select matching policies
        const matchingPolicies = policyLibrary
            .filter(p => p.documentTypes.some(t => category.toLowerCase().includes(t.toLowerCase())))
            .map(p => p.id);
        setSelectedPolicies(matchingPolicies);

        return {
            name: fileName,
            type: fileName.split('.').pop()?.toUpperCase() || 'PDF',
            category,
            regulation
        };
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setIsProcessing(true);
            setTimeout(() => {
                const detected = detectDocumentType(files[0].name);
                setDetectedDoc(detected);
                setIsProcessing(false);
            }, 1500);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileSelect = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const detected = detectDocumentType('Q2_Marketing_Campaign.pdf');
            setDetectedDoc(detected);
            setIsProcessing(false);
        }, 1500);
    };

    const handleStartReview = () => {
        onStartReview('1');
        onClose();
        setDetectedDoc(null);
        setSelectedPolicies([]);
        setActiveTab('upload');
    };

    const handleClose = () => {
        onClose();
        setDetectedDoc(null);
        setIsProcessing(false);
        setSelectedPolicies([]);
        setActiveTab('upload');
        setShowPolicyPicker(false);
    };

    const togglePolicy = (policyId: string) => {
        setSelectedPolicies(prev =>
            prev.includes(policyId)
                ? prev.filter(id => id !== policyId)
                : [...prev, policyId]
        );
    };

    const getSelectedPolicyObjects = (): PolicyDocument[] => {
        return policyLibrary.filter(p => selectedPolicies.includes(p.id));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Tabs */}
                    <div className="border-b border-gray-800">
                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Document Upload</h2>
                                <p className="text-sm text-gray-400 mt-1">Upload documents and manage compliance policies</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-6 pt-4">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'upload'
                                        ? 'bg-[#252525] text-white border-b-2 border-blue-500'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <Upload className="w-4 h-4 inline mr-2" />
                                Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('policies')}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'policies'
                                        ? 'bg-[#252525] text-white border-b-2 border-purple-500'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 inline mr-2" />
                                Policy Library
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'upload' && (
                            <>
                                {!detectedDoc && !isProcessing && (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mx-auto mb-4">
                                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
                                        </div>
                                        <p className="text-lg font-medium text-gray-200 mb-2">
                                            {isDragging ? 'Drop file here' : 'Drag & drop your document'}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">PDF, DOCX, or XLSX files</p>
                                        <Button
                                            onClick={handleFileSelect}
                                            variant="outline"
                                            className="border-gray-700 text-gray-300 hover:bg-[#252525]"
                                        >
                                            Browse Files
                                        </Button>
                                    </div>
                                )}

                                {isProcessing && (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <FileText className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-200 mb-2">Analyzing document...</p>
                                        <p className="text-sm text-gray-500">Detecting type and matching policies</p>
                                    </div>
                                )}

                                {detectedDoc && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Detection Success */}
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-400">Document Analyzed</p>
                                                <p className="text-sm text-gray-400">{detectedDoc.name}</p>
                                            </div>
                                        </div>

                                        {/* Detected Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-[#252525] border border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Document Type</span>
                                                </div>
                                                <p className="font-medium text-gray-200">{detectedDoc.category}</p>
                                                <p className="text-xs text-gray-500 mt-1">{detectedDoc.type} Format</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-[#252525] border border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-400 uppercase tracking-wide">Matched Regulation</span>
                                                </div>
                                                <p className="font-medium text-gray-200 text-sm">{detectedDoc.regulation.name.split(' - ')[0]}</p>
                                                <p className="text-xs text-gray-500 mt-1">{detectedDoc.regulation.name.split(' - ')[1]}</p>
                                            </div>
                                        </div>

                                        {/* Applied Policies */}
                                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm font-medium text-purple-400">Applied Policies ({selectedPolicies.length})</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowPolicyPicker(!showPolicyPicker)}
                                                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                >
                                                    <Settings className="w-3 h-3" />
                                                    Manage
                                                </button>
                                            </div>

                                            {getSelectedPolicyObjects().length > 0 ? (
                                                <div className="space-y-2">
                                                    {getSelectedPolicyObjects().map(policy => (
                                                        <div key={policy.id} className="flex items-center justify-between p-2 rounded bg-purple-500/10">
                                                            <div>
                                                                <p className="text-sm text-gray-200">{policy.code}</p>
                                                                <p className="text-xs text-gray-400">{policy.name}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => togglePolicy(policy.id)}
                                                                className="p-1 hover:bg-red-500/20 rounded"
                                                            >
                                                                <Trash2 className="w-3 h-3 text-red-400" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No policies applied. Click Manage to add.</p>
                                            )}

                                            {/* Policy Picker */}
                                            <AnimatePresence>
                                                {showPolicyPicker && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-3 pt-3 border-t border-purple-500/30 space-y-2 max-h-40 overflow-y-auto"
                                                    >
                                                        {policyLibrary.filter(p => !selectedPolicies.includes(p.id)).map(policy => (
                                                            <button
                                                                key={policy.id}
                                                                onClick={() => togglePolicy(policy.id)}
                                                                className="w-full flex items-center justify-between p-2 rounded bg-[#252525] hover:bg-[#333] transition-colors text-left"
                                                            >
                                                                <div>
                                                                    <p className="text-sm text-gray-200">{policy.code}</p>
                                                                    <p className="text-xs text-gray-400">{policy.name}</p>
                                                                </div>
                                                                <Plus className="w-4 h-4 text-purple-400" />
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {activeTab === 'policies' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">Browse and manage company policy documents that will be applied during compliance review.</p>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {policyLibrary.map(policy => (
                                        <div
                                            key={policy.id}
                                            className="p-4 rounded-lg bg-[#252525] border border-gray-800 hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{policy.code}</span>
                                                        <span className="text-xs text-gray-500">v{policy.version}</span>
                                                    </div>
                                                    <p className="font-medium text-gray-200">{policy.name}</p>
                                                    <p className="text-sm text-gray-400 mt-1">{policy.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-gray-500">Applies to:</span>
                                                        {policy.documentTypes.slice(0, 3).map((type, i) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">{type}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Updated {new Date(policy.lastUpdated).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {((activeTab === 'upload' && detectedDoc) || activeTab === 'policies') && (
                        <div className="p-6 border-t border-gray-800 bg-[#1a1a1a]">
                            {activeTab === 'upload' && detectedDoc && (
                                <Button
                                    onClick={handleStartReview}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    Start Compliance Review
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            {activeTab === 'policies' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">{policyLibrary.length} policies available</span>
                                    <Button
                                        variant="outline"
                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Policy
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
