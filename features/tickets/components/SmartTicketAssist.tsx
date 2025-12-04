
import React, { useState } from 'react';
import { Ticket, TicketComment } from '../../../types';
import { analyzeTicketWithGemini, TicketAnalysis } from '../../../services/aiService';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Sparkles, BrainCircuit, MessageSquare, Copy, Check, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../contexts/ToastContext';
import { useComments } from '../hooks/useComments';

interface SmartTicketAssistProps {
  ticket: Ticket;
}

export const SmartTicketAssist: React.FC<SmartTicketAssistProps> = ({ ticket }) => {
  const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { comments } = useComments(ticket.id); // Fetch latest comments for context
  const toast = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeTicketWithGemini(ticket, comments);
      setAnalysis(result);
      toast.success("Analysis complete");
    } catch (err) {
      toast.error("Failed to analyze ticket. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDraft = () => {
    if (analysis?.draftResponse) {
      navigator.clipboard.writeText(analysis.draftResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("Draft response copied to clipboard");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Angry': return 'bg-red-100 text-red-800 border-red-200';
      case 'Frustrated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Urgent': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Happy': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-900/10">
        <CardTitle className="flex items-center gap-2 text-base text-indigo-900 dark:text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Smart Assist
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {!analysis ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Use Gemini AI to analyze this ticket, detect sentiment, and suggest solutions.
            </p>
            <Button 
              onClick={handleAnalyze} 
              isLoading={isLoading} 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
            >
              <BrainCircuit className="w-4 h-4 mr-2" />
              Analyze Ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Sentiment & Summary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Analysis</span>
                <Badge className={getSentimentColor(analysis.sentiment)}>{analysis.sentiment}</Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Root Cause */}
            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Probable Root Cause
              </h4>
              <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
                {analysis.rootCause}
              </p>
            </div>

            {/* Suggested Actions */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Suggested Actions</h4>
              <ul className="space-y-2">
                {analysis.suggestedActions.map((action, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2">
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Draft Response */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Draft Response
                </h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCopyDraft}>
                  {copied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300 italic whitespace-pre-wrap">
                "{analysis.draftResponse}"
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleAnalyze} isLoading={isLoading} className="w-full text-xs text-gray-500">
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
