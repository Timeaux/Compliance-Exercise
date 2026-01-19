import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, AlertCircle, Lock, CheckCircle2, X } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';

interface ReasoningStep {
  step: number;
  action: string;
  status: 'complete' | 'current';
}

const reasoningSteps: ReasoningStep[] = [
  { step: 1, action: 'Scanned Document Text', status: 'complete' },
  { step: 2, action: 'Matched Keyword: "Guarantee"', status: 'complete' },
  { step: 3, action: 'Checked against FCRA Section 4', status: 'complete' },
  { step: 4, action: 'Flagged Violation', status: 'current' }
];

interface HighlightedText {
  id: number;
  text: string;
  type: 'high' | 'medium' | 'compliant';
  confidence: number;
  violation?: string;
}

interface AgenticWorkflowProps {
  selectedHighlight: HighlightedText | null;
  activeAction: 'ask' | 'rewrite' | 'override' | null;
  onActionComplete: () => void;
}

export function AgenticWorkflow({ selectedHighlight, activeAction, onActionComplete }: AgenticWorkflowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [justification, setJustification] = useState('');
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  const [editedText, setEditedText] = useState('');
  const overrideRef = useRef<HTMLDivElement>(null);

  // Handle active actions from toolbar
  useEffect(() => {
    if (activeAction === 'ask') {
      setIsExpanded(true);
    } else if (activeAction === 'rewrite' && selectedHighlight) {
      setEditedText(selectedHighlight.text);
    } else if (activeAction === 'override') {
      setShowOverride(true);
      // Scroll to override section
      setTimeout(() => {
        overrideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeAction, selectedHighlight]);

  const handleSubmitOverride = () => {
    setOverrideSubmitted(true);
    setShowOverride(false);
    setTimeout(() => {
      setOverrideSubmitted(false);
      setJustification('');
      onActionComplete();
    }, 3000);
  };

  const handleCancelRewrite = () => {
    setEditedText('');
    onActionComplete();
  };

  const handleSaveRewrite = () => {
    console.log('Saved rewritten text:', editedText);
    setEditedText('');
    onActionComplete();
  };

  if (!selectedHighlight) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full bg-[#191919] p-6 flex items-center justify-center"
      >
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <p>Select a highlighted section to view agent reasoning</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full bg-[#191919] p-6 overflow-y-auto"
    >
      <h3 className="text-sm tracking-wide text-gray-400 uppercase mb-6">Agent Reasoning Stream</h3>

      {/* Rewrite Mode */}
      {activeAction === 'rewrite' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-blue-400">Rewrite Mode</h4>
            <button
              onClick={handleCancelRewrite}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="mb-3 min-h-24 text-sm bg-[#1e1e1e] border-gray-700 text-gray-200"
            placeholder="Edit the text..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSaveRewrite}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
            <Button
              onClick={handleCancelRewrite}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Override Submitted Status */}
      <AnimatePresence>
        {overrideSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-4 rounded-lg bg-green-500/10 border-2 border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="font-semibold text-sm text-green-400">Override Request Sent</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Your override request has been submitted for review and will be processed shortly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 p-5 rounded-lg border-2 transition-all ${
          selectedHighlight.type === 'high'
            ? 'bg-red-500/10 border-red-500/30'
            : selectedHighlight.type === 'medium'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {selectedHighlight.violation && (
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Violation Detected</p>
            )}
            <h4 className={`font-semibold text-base mb-1 ${
              selectedHighlight.type === 'high' ? 'text-red-400' :
              selectedHighlight.type === 'medium' ? 'text-amber-400' :
              'text-green-400'
            }`}>
              {selectedHighlight.violation || 'Verified Compliant'}
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              Selected Text: "{selectedHighlight.text}"
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
                  animate={{ width: `${selectedHighlight.confidence}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`h-full ${
                    selectedHighlight.type === 'high'
                      ? 'bg-red-500'
                      : selectedHighlight.type === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-gray-200">{selectedHighlight.confidence}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Thought Process */}
      <Card className="mb-4 overflow-hidden bg-[#1e1e1e] border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
        >
          <span className="font-medium text-sm text-gray-200">Thought Process</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

                  {reasoningSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-12 pb-6 last:pb-0"
                    >
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'complete'
                            ? 'bg-blue-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {step.step}
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-medium text-gray-200">{step.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {step.status === 'complete' ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Override Gate */}
      {selectedHighlight.type === 'high' && selectedHighlight.confidence >= 90 && (
        <motion.div
          ref={overrideRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!showOverride ? (
            <Card className="p-4 border-2 border-gray-700 bg-[#1e1e1e]">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-200">High Confidence Flag</h4>
                  <p className="text-xs text-gray-400">
                    This violation was flagged with {selectedHighlight.confidence}% confidence.
                    Override requires justification.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowOverride(true)}
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
              className="border-2 border-red-500/30 bg-red-500/10 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-sm text-red-400">
                  Override Requires Justification
                </h4>
              </div>
              <p className="text-xs text-gray-300 mb-3">
                To maintain audit trail integrity, please provide regulatory justification for
                overriding this {selectedHighlight.confidence}% confidence flag.
              </p>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter regulatory justification..."
                className="mb-3 min-h-24 text-sm bg-[#1e1e1e] border-gray-700 text-gray-200"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitOverride}
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={justification.length < 20}
                >
                  Submit Override
                </Button>
                <Button
                  onClick={() => {
                    setShowOverride(false);
                    setJustification('');
                    onActionComplete();
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
      {selectedHighlight.type === 'compliant' && (
        <Card className="p-4 border-2 border-green-500/30 bg-green-500/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
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
