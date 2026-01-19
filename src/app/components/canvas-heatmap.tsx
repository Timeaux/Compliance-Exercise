import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, RefreshCw, ShieldCheck, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { ComplianceTask } from '@/app/data/document-data';

interface FloatingToolbarProps {
  position: { x: number; y: number };
  onAction: (action: 'comment' | 'rewrite' | 'override') => void;
}

function FloatingToolbar({ position, onAction }: FloatingToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed z-50 bg-[#2a2a2a] rounded-full shadow-xl border border-gray-700 px-2 py-2 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <button
        onClick={() => onAction('comment')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors text-gray-200"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">Comment</span>
      </button>
      <div className="w-px h-6 bg-gray-700" />
      <button
        onClick={() => onAction('rewrite')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors text-gray-200"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm">Rewrite</span>
      </button>
      <div className="w-px h-6 bg-gray-700" />
      <button
        onClick={() => onAction('override')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors text-gray-200"
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="text-sm">Override</span>
      </button>
    </motion.div>
  );
}

interface CanvasHeatmapProps {
  documentContent?: string;
  tasks: ComplianceTask[];
  onSelectHighlight: (task: ComplianceTask | null) => void;
  onToolbarAction: (action: 'comment' | 'rewrite' | 'override', task: ComplianceTask) => void;
  selectedId: number | null;
}

interface HighlightSpanProps {
  task: ComplianceTask;
  isSelected: boolean;
  onClick: (id: number, event: React.MouseEvent) => void;
}

function HighlightSpan({ task, isSelected, onClick }: HighlightSpanProps) {
  const bgColor =
    task.type === 'high'
      ? 'bg-red-500/30 hover:bg-red-500/40'
      : task.type === 'medium'
        ? 'bg-amber-500/30 hover:bg-amber-500/40'
        : 'bg-green-500/30 hover:bg-green-500/40';

  return (
    <span
      onClick={(e) => onClick(task.id, e)}
      className={`relative inline cursor-pointer px-1 rounded transition-all ${bgColor} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#191919] ring-blue-500 shadow-lg scale-105' : ''
        }`}
    >
      {task.text}
    </span>
  );
}

export function CanvasHeatmap({ documentContent, tasks, onSelectHighlight, onToolbarAction, selectedId }: CanvasHeatmapProps) {
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [toolbarTaskId, setToolbarTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleHighlightClick = (id: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setToolbarPosition({
      x: rect.left + rect.width / 2 - 160,
      y: rect.top - 60
    });
    setToolbarTaskId(id);
    const task = tasks.find((t) => t.id === id);
    onSelectHighlight(task || null);
  };

  const handleToolbarAction = (action: 'comment' | 'rewrite' | 'override') => {
    const task = tasks.find(t => t.id === toolbarTaskId);
    if (task) {
      onToolbarAction(action, task);
    }
    setToolbarPosition(null);
    setToolbarTaskId(null);
  };

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarPosition && !(e.target as HTMLElement).closest('.floating-toolbar')) {
        setToolbarPosition(null);
        setToolbarTaskId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [toolbarPosition]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery || !documentContent) {
      setSearchResults([]);
      return;
    }

    const lowerContent = documentContent.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const indices: number[] = [];
    let pos = 0;

    while ((pos = lowerContent.indexOf(lowerQuery, pos)) !== -1) {
      indices.push(pos);
      pos += 1;
    }

    setSearchResults(indices);
    setCurrentMatchIndex(0);
  }, [searchQuery, documentContent]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
        setToolbarPosition(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateSearch = (direction: 'prev' | 'next') => {
    if (searchResults.length === 0) return;
    if (direction === 'next') {
      setCurrentMatchIndex((prev) => (prev + 1) % searchResults.length);
    } else {
      setCurrentMatchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  // Initialize with first task selected
  useEffect(() => {
    if (tasks.length > 0 && selectedId === null) {
      onSelectHighlight(tasks[0]);
    }
  }, [tasks]);

  // Render content with highlights and search matches
  const renderContentWithHighlights = () => {
    if (!documentContent) {
      return <p className="text-gray-500">No content available</p>;
    }

    const lines = documentContent.split('\n');

    return lines.map((line, lineIndex) => {
      let processedLine: React.ReactNode = line;
      let hasHighlight = false;

      // Check for compliance task highlights
      for (const task of tasks) {
        if (line.includes(task.text)) {
          hasHighlight = true;
          const parts = line.split(task.text);
          processedLine = (
            <>
              {renderWithSearchHighlight(parts[0])}
              <HighlightSpan
                task={task}
                isSelected={selectedId === task.id}
                onClick={handleHighlightClick}
              />
              {renderWithSearchHighlight(parts.slice(1).join(task.text))}
            </>
          );
          break;
        }
      }

      if (!hasHighlight) {
        processedLine = renderWithSearchHighlight(line);
      }

      // Style based on content type
      if (line.startsWith('# ') || line === line.toUpperCase() && line.length > 10 && line.trim()) {
        return (
          <p key={lineIndex} className="text-2xl font-semibold mb-4 mt-6 text-white">
            {processedLine}
          </p>
        );
      }

      if (line.startsWith('## ') || (line.endsWith(':') && line.length < 50 && !line.includes('•'))) {
        return (
          <p key={lineIndex} className="text-lg font-semibold mt-6 mb-2 text-gray-200">
            {processedLine}
          </p>
        );
      }

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={lineIndex} className="ml-6 mb-1">
            {typeof processedLine === 'string' ? processedLine.substring(2) : processedLine}
          </li>
        );
      }

      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }

      return (
        <p key={lineIndex} className="mb-2">
          {processedLine}
        </p>
      );
    });
  };

  // Helper to add search highlighting to text
  const renderWithSearchHighlight = (text: string) => {
    if (!searchQuery || typeof text !== 'string') return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    let pos = 0;
    while ((pos = lowerText.indexOf(lowerQuery, lastIndex)) !== -1) {
      if (pos > lastIndex) {
        parts.push(text.substring(lastIndex, pos));
      }
      parts.push(
        <mark key={pos} className="bg-yellow-500/50 text-white rounded px-0.5">
          {text.substring(pos, pos + searchQuery.length)}
        </mark>
      );
      lastIndex = pos + searchQuery.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full bg-[#191919] flex flex-col relative"
    >
      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-[#2a2a2a] rounded-lg border border-gray-700 px-3 py-2 shadow-xl"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in document..."
              className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-48"
            />
            {searchResults.length > 0 && (
              <>
                <span className="text-xs text-gray-400">
                  {currentMatchIndex + 1}/{searchResults.length}
                </span>
                <div className="flex items-center gap-1 border-l border-gray-700 pl-2 ml-1">
                  <button
                    onClick={() => navigateSearch('prev')}
                    className="p-1 hover:bg-[#333] rounded transition-colors"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigateSearch('next')}
                    className="p-1 hover:bg-[#333] rounded transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="p-1 hover:bg-[#333] rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Toggle Button */}
      {!showSearch && (
        <button
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          className="absolute top-4 right-4 z-40 p-2 bg-[#2a2a2a] rounded-lg border border-gray-700 hover:bg-[#333] transition-colors"
          title="Search (⌘F)"
        >
          <Search className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Document Content */}
      <div
        className="flex-1 p-12 overflow-y-auto"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 31px,
              rgba(55, 65, 81, 0.2) 31px,
              rgba(55, 65, 81, 0.2) 32px
            )
          `
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-sm prose-invert leading-relaxed text-gray-300">
            {renderContentWithHighlights()}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toolbarPosition && (
          <div className="floating-toolbar">
            <FloatingToolbar position={toolbarPosition} onAction={handleToolbarAction} />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}