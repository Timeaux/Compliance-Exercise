import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CanvasHeatmap } from '@/app/components/canvas-heatmap';
import { TaskListPanel } from '@/app/components/task-list-panel';
import { DocumentGrid } from '@/app/components/document-grid';
import { AuditHistoryPanel } from '@/app/components/audit-history-panel';
import { UploadIntake } from '@/app/components/upload-intake';
import { HandoffModal } from '@/app/components/handoff-modal';
import { DiffView } from '@/app/components/diff-view';
import { documents, ComplianceTask, AuditEntry } from '@/app/data/document-data';
import { ChevronLeft, ChevronRight, ArrowLeft, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Norm AI Command Center - Unified Compliance Workspace
 * Per OBJECTIVES.md
 */

type ViewState = 'documents' | 'review';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('documents');
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [overrideSubmittedTasks, setOverrideSubmittedTasks] = useState<Set<number>>(new Set());
  const [taskComments, setTaskComments] = useState<Record<number, string>>({});
  const [manualViolations, setManualViolations] = useState<{ id: number; text: string; description: string }[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [nextManualId, setNextManualId] = useState(100);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [editingVersionIndex, setEditingVersionIndex] = useState<number | null>(null); // For V1-style editing of specific version

  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load document data when document changes
  useEffect(() => {
    if (currentDocumentId && documents[currentDocumentId]) {
      setAuditHistory(documents[currentDocumentId].auditHistory);
      setManualViolations([]);
      setOverrideSubmittedTasks(new Set());
      setTaskComments({});
      setSelectedTaskId(null);
    }
  }, [currentDocumentId]);

  const handleSelectDocument = (docId: string) => {
    setCurrentDocumentId(docId);
    setCurrentView('review');
  };

  const handleBackToDocuments = () => {
    setCurrentView('documents');
    setCurrentDocumentId(null);
  };

  const handleSubmitOverride = (taskId: number, justification: string) => {
    setOverrideSubmittedTasks(prev => new Set(prev).add(taskId));

    const task = currentDocument?.tasks.find(t => t.id === taskId);
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Override Applied',
      details: `Overrode "${task?.text}" - ${justification.substring(0, 50)}${justification.length > 50 ? '...' : ''}`
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleSaveComment = (taskId: number, comment: string) => {
    setTaskComments(prev => ({ ...prev, [taskId]: comment }));

    const task = currentDocument?.tasks.find(t => t.id === taskId);
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Comment Added',
      details: `Added comment on "${task?.text}"`
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleAddManualViolation = (text: string, description: string) => {
    setManualViolations(prev => [...prev, { id: nextManualId, text, description }]);
    setNextManualId(prev => prev + 1);

    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Manual Flag Added',
      details: `Flagged: "${text}"`
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleRemoveManualViolation = (id: number) => {
    setManualViolations(prev => prev.filter(v => v.id !== id));
  };

  const handleOpenHandoffModal = () => {
    setShowHandoffModal(true);
  };

  const handleSendToMarketing = () => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Sent to Marketing',
      details: `Document sent for revision with compliance instructions.`
    };
    setAuditHistory(prev => [newEntry, ...prev]);
    setManualViolations([]);
  };

  const handleApproveDocument = () => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Review Approved',
      details: 'Document approved - all compliance requirements satisfied.'
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleApproveChanges = () => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Changes Approved',
      details: 'Document revisions approved and finalized.'
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleDeclineChanges = (feedback: string) => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Changes Declined',
      details: `Sent back for revision: ${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}`
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleViewDiff = (versionIndex: number) => {
    setShowDiffView(true);
  };

  const handleEditDocument = () => {
    // Set to edit the latest version in V1 interface
    const latestVersionIndex = (currentDocument?.versions.length || 1) - 1;
    setEditingVersionIndex(latestVersionIndex);

    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'analyst',
      action: 'Editing V2',
      details: 'Opened V2 content in editing interface for direct revisions.'
    };
    setAuditHistory(prev => [newEntry, ...prev]);
  };

  const handleToolbarAction = (action: 'comment' | 'rewrite' | 'override', task: ComplianceTask) => {
    // Navigate to task detail and focus on the relevant section
    setSelectedTaskId(task.id);

    // For now, just selecting the task will show the detail view
    // The user can then use override or comment from there
  };

  const currentDocument = currentDocumentId ? documents[currentDocumentId] : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#191919] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentView === 'review' && (
            <button
              onClick={handleBackToDocuments}
              className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center hover:bg-[#333] transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {currentView === 'documents' ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Norm AI Command Center</h1>
                <p className="text-xs text-gray-400">Document Library</p>
              </div>
            </>
          ) : (
            <>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentDocument?.type === 'PDF' ? 'bg-red-500/20' :
                currentDocument?.type === 'DOCX' ? 'bg-blue-500/20' : 'bg-green-500/20'
                }`}>
                <FileText className={`w-5 h-5 ${currentDocument?.type === 'PDF' ? 'text-red-400' :
                  currentDocument?.type === 'DOCX' ? 'text-blue-400' : 'text-green-400'
                  }`} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{currentDocument?.title}</h1>
                <p className="text-xs text-gray-400">
                  {currentDocument?.type} • {currentDocument?.matchedRegulation?.split(' - ')[0]}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentView === 'documents' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              Live
            </span>
            <span>Last sync: 2m ago</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'documents' ? (
          <motion.div
            key="documents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <DocumentGrid onSelectDocument={handleSelectDocument} />
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden relative flex"
          >
            {/* Audit History Panel (collapsible, left side) */}
            <AuditHistoryPanel
              entries={auditHistory}
              versions={currentDocument?.versions || []}
              onViewDiff={handleViewDiff}
            />

            {/* Main Panel Group */}
            <div className="flex-1 relative">
              <PanelGroup direction="horizontal">
                {/* Center Panel - Canvas & Heatmap */}
                <Panel
                  id="center-panel"
                  order={1}
                  defaultSize={rightCollapsed ? 100 : 70}
                  minSize={50}
                >
                  <CanvasHeatmap
                    documentContent={currentDocument?.content}
                    tasks={currentDocument?.tasks || []}
                    onSelectHighlight={(task) => {
                      setSelectedTaskId(task?.id || null);
                    }}
                    onToolbarAction={handleToolbarAction}
                    selectedId={selectedTaskId}
                  />
                </Panel>

                {/* Right Panel - Task List */}
                {!rightCollapsed && (
                  <>
                    <PanelResizeHandle className="w-px bg-gray-800 hover:bg-blue-500 hover:w-0.5 transition-all" />
                    <Panel id="right-panel" order={2} defaultSize={30} minSize={25} maxSize={45}>
                      <div className="h-full relative border-l border-gray-800">
                        <TaskListPanel
                          tasks={currentDocument?.tasks || []}
                          selectedTaskId={selectedTaskId}
                          onTaskSelect={(task) => setSelectedTaskId(task?.id || null)}
                          overrideSubmittedTasks={overrideSubmittedTasks}
                          onSubmitOverride={handleSubmitOverride}
                          taskComments={taskComments}
                          onSaveComment={handleSaveComment}
                          manualViolations={manualViolations}
                          onAddManualViolation={handleAddManualViolation}
                          onRemoveManualViolation={handleRemoveManualViolation}
                          onSendToMarketing={handleOpenHandoffModal}
                          onApproveDocument={handleApproveDocument}
                        />
                        <button
                          onClick={() => setRightCollapsed(true)}
                          className="absolute top-4 left-2 w-6 h-6 bg-[#2a2a2a] rounded-full shadow-lg flex items-center justify-center hover:bg-[#333] transition-colors z-10 border border-gray-700"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </Panel>
                  </>
                )}

                {/* Collapsed Right Panel Toggle */}
                {rightCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50">
                    <button
                      onClick={() => setRightCollapsed(false)}
                      className="w-8 h-16 bg-[#2a2a2a] rounded-l-lg shadow-lg flex items-center justify-center hover:bg-[#333] transition-colors border border-r-0 border-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </PanelGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <footer className="border-t border-gray-800 bg-[#1e1e1e] px-6 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {currentView === 'documents' ? (
            <span>Viewing Document Library</span>
          ) : (
            <>
              <span>{currentDocument?.tasks.length || 0} Compliance Items</span>
              <span>•</span>
              <span>Score: {currentDocument?.complianceScore}%</span>
              {(currentDocument?.versions.length || 0) > 1 && (
                <>
                  <span>•</span>
                  <span>V{currentDocument?.versions.length}</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <span className="font-semibold text-gray-300">Norm AI</span>
        </div>
      </footer>

      {/* Modals */}
      <UploadIntake
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onStartReview={(docId) => handleSelectDocument(docId)}
      />

      <HandoffModal
        isOpen={showHandoffModal}
        onClose={() => setShowHandoffModal(false)}
        documentTitle={currentDocument?.title || ''}
        tasks={currentDocument?.tasks || []}
        overriddenTaskIds={overrideSubmittedTasks}
        taskComments={taskComments}
        manualViolations={manualViolations}
        onSend={handleSendToMarketing}
      />

      <DiffView
        isOpen={showDiffView}
        onClose={() => setShowDiffView(false)}
        documentTitle={currentDocument?.title || ''}
        versions={currentDocument?.versions || []}
        onApprove={handleApproveChanges}
        onDecline={handleDeclineChanges}
        onEditDocument={handleEditDocument}
      />
    </div>
  );
}

export default App;