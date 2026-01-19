import { FileText } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface HighlightedText {
  id: number;
  text: string;
  type: 'high' | 'medium' | 'compliant';
  confidence: number;
  violation?: string;
}

interface MacroDashboardProps {
  onTaskSelect: (task: HighlightedText) => void;
  selectedTaskId: number | null;
}

export function MacroDashboard({ onTaskSelect, selectedTaskId }: MacroDashboardProps) {
  return (
    <div className="h-full bg-[#191919] p-6 overflow-y-auto">
      <h2 className="text-sm tracking-wide text-gray-400 uppercase mb-6">Document Summary</h2>

      {/* Document Info */}
      <Card className="p-4 mb-6 bg-[#1e1e1e] border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-200 truncate">Q1 Marketing Flyer</h3>
            <p className="text-xs text-gray-500">PDF • Today, 2:34 PM</p>
          </div>
        </div>
      </Card>

      {/* Issue Summary */}
      <Card className="p-4 mb-6 bg-[#1e1e1e] border-gray-800">
        <h3 className="text-sm tracking-wide text-gray-400 uppercase mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Issue Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 rounded bg-[#252525] hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <span className="text-gray-300">Total Issues</span>
            <span className="text-red-400 font-semibold">3</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-[#252525] hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <span className="text-gray-300">High Priority</span>
            <span className="text-red-400 font-semibold">1</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-[#252525] hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <span className="text-gray-300">Medium Priority</span>
            <span className="text-amber-400 font-semibold">1</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-[#252525] hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <span className="text-gray-300">Verified Compliant</span>
            <span className="text-green-400 font-semibold">1</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-[#1e1e1e] border-gray-800">
        <h3 className="text-sm tracking-wide text-gray-400 uppercase mb-3">How to Review</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0 text-xs">1</span>
            <p>Click highlighted text in the document to see details</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0 text-xs">2</span>
            <p>Review agent reasoning in the right panel</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0 text-xs">3</span>
            <p>Use the toolbar to rewrite or request override</p>
          </div>
        </div>
      </Card>
    </div>
  );
}