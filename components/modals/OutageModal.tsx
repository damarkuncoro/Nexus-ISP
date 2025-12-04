
import React, { useState } from 'react';
import { NetworkDevice } from '../../types';
import { generateOutageMessage, OutageNotification } from '../../services/aiService';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { AlertTriangle, Mail, MessageSquare, Sparkles, Send, Users } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface OutageModalProps {
  device: NetworkDevice;
  isOpen: boolean;
  onClose: () => void;
}

export const OutageModal: React.FC<OutageModalProps> = ({ device, isOpen, onClose }) => {
  const [draft, setDraft] = useState<OutageNotification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [affectedCount] = useState(Math.floor(Math.random() * 50) + 10); // Mock affected users
  const toast = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateOutageMessage(device, affectedCount);
      setDraft(result);
    } catch (err) {
      toast.error("Failed to generate draft. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    setIsSending(true);
    // Simulate API call to SMS/Email gateway
    setTimeout(() => {
        setIsSending(false);
        toast.success(`Outage notification sent to ${affectedCount} subscribers.`);
        onClose();
    }, 1500);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Report Network Outage
        </DialogTitle>
        <DialogDescription>
            Manage communication for the incident affecting <strong>{device.name}</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-300">Impact Analysis</p>
                    <p className="text-xs text-orange-700 dark:text-orange-400">Approximately {affectedCount} subscribers affected in {device.location || 'this area'}.</p>
                </div>
            </div>
        </div>

        {!draft ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                <Sparkles className="w-10 h-10 text-primary-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-white">AI Notification Drafter</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-1 mb-4">
                    Let Gemini draft a professional apology and status update for your customers.
                </p>
                <Button onClick={handleGenerate} isLoading={isLoading} className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white border-0">
                    <Sparkles className="w-4 h-4 mr-2" /> Generate Draft
                </Button>
            </div>
        ) : (
            <Tabs defaultValue="email" className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email Blast</TabsTrigger>
                    <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" /> SMS / WhatsApp</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                    <div>
                        <Label htmlFor="subject">Subject Line</Label>
                        <Input 
                            id="subject" 
                            value={draft.subject} 
                            onChange={(e) => setDraft({...draft, subject: e.target.value})} 
                        />
                    </div>
                    <div>
                        <Label htmlFor="body">Message Body</Label>
                        <Textarea 
                            id="body" 
                            value={draft.emailBody} 
                            onChange={(e) => setDraft({...draft, emailBody: e.target.value})} 
                            rows={8}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <Label className="mb-2 block text-xs uppercase text-gray-500">Preview</Label>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm max-w-sm">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{draft.smsBody}</p>
                        </div>
                        <div className="mt-2 text-right">
                            <span className={`text-xs ${draft.smsBody.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                {draft.smsBody.length} / 160 chars
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="sms-edit">Edit SMS Content</Label>
                        <Textarea 
                            id="sms-edit" 
                            value={draft.smsBody} 
                            onChange={(e) => setDraft({...draft, smsBody: e.target.value})} 
                            rows={3}
                        />
                    </div>
                </TabsContent>
                
                <div className="mt-4 flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Est. Downtime: {draft.estimatedDuration}</span>
                    <Button variant="ghost" size="sm" onClick={handleGenerate} className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800">Regenerate</Button>
                </div>
            </Tabs>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
            disabled={!draft || isSending} 
            isLoading={isSending} 
            onClick={handleBroadcast}
            className="bg-red-600 hover:bg-red-700 text-white"
        >
            <Send className="w-4 h-4 mr-2" /> Broadcast Alert
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
