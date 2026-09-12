import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Phone, Mail, ExternalLink, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { enquiryService } from '@/services/enquiryService';
import { formatRelativeDate } from '@/utils/helpers';
import type { Enquiry, EnquiryStatus } from '@/types';

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'bg-one-red/20 text-one-red',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-green-500/20 text-green-400',
};

const TABS: { label: string; value: EnquiryStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Closed', value: 'closed' },
];

export default function AdminEnquiriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['enquiries', filter],
    queryFn: () => enquiryService.getAll(filter === 'all' ? undefined : filter),
  });

  const handleStatusUpdate = async (id: string, status: EnquiryStatus) => {
    try {
      await enquiryService.updateStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast({ title: `Marked as ${status}` });
    } catch (e: any) { toast({ title: 'Failed to update', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    try {
      await enquiryService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast({ title: 'Enquiry deleted' });
    } catch (e: any) { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Enquiries</h1>
        <p className="text-gray-400">Messages and enquiries from potential customers.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {TABS.map(tab => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? 'default' : 'outline'}
            size="sm"
            className={filter !== tab.value ? 'border-white/20 text-gray-400' : ''}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
            {tab.value === 'new' && enquiries && (
              <span className="ml-1.5 bg-white/20 text-xs px-1.5 rounded-full">
                {enquiries.filter(e => e.status === 'new').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Enquiries List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : enquiries?.length === 0 ? (
          <div className="text-center py-16 bg-one-charcoal rounded-xl border border-white/10">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-1">No enquiries yet</p>
            <p className="text-gray-500">When customers send messages, they'll appear here.</p>
          </div>
        ) : (
          enquiries?.map(enq => (
            <div key={enq.id} className="bg-one-charcoal border border-white/10 rounded-xl overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-one-black/30 transition-colors"
                onClick={() => setExpanded(expanded === enq.id ? null : enq.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {enq.status === 'new' && <span className="w-2.5 h-2.5 rounded-full bg-one-red animate-pulse shrink-0" />}
                      <span className="font-semibold text-white">{enq.name}</span>
                      <Badge className={`text-[10px] uppercase ${STATUS_STYLES[enq.status]}`}>{enq.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{enq.message}</p>
                    {enq.listing && (
                      <p className="text-xs text-one-red mt-1">Re: {(enq.listing as any).title}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">{formatRelativeDate(enq.created_at)}</span>
                </div>
              </div>

              {/* Expanded View */}
              {expanded === enq.id && (
                <div className="border-t border-white/10 p-4 bg-one-black/30 space-y-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{enq.message}</p>
                  
                  <div className="flex flex-wrap gap-3 text-sm">
                    {enq.phone && (
                      <a href={`tel:${enq.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                        <Phone className="h-4 w-4" /> {enq.phone}
                      </a>
                    )}
                    {enq.email && (
                      <a href={`mailto:${enq.email}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                        <Mail className="h-4 w-4" /> {enq.email}
                      </a>
                    )}
                    {enq.phone && (
                      <a
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {enq.status !== 'contacted' && (
                      <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" onClick={() => handleStatusUpdate(enq.id, 'contacted')}>
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Mark Contacted
                      </Button>
                    )}
                    {enq.status !== 'closed' && (
                      <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleStatusUpdate(enq.id, 'closed')}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Closed
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-one-red ml-auto" onClick={() => handleDelete(enq.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
