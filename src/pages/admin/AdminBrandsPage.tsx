import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { brandService } from '@/services/brandService';
import type { Brand, CreateBrandInput } from '@/types';

export default function AdminBrandsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: brands, isLoading } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.getAll() });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<CreateBrandInput>({ name: '' });
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm({ name: '' }); setDialogOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, slug: b.slug }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await brandService.update(editing.id, form);
        toast({ title: 'Brand updated' });
      } else {
        await brandService.create(form);
        toast({ title: 'Brand created' });
      }
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await brandService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({ title: 'Brand deleted' });
    } catch (e: any) { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="text-gray-400">Manage vehicle and product brands.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>

      <div className="max-w-full bg-one-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="max-w-full overflow-x-auto">
        <table className="min-w-[460px] w-full text-left text-sm">
          <thead className="bg-one-black/50 text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {isLoading ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : brands?.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500"><Tag className="h-8 w-8 mx-auto mb-2 text-gray-600" />No brands yet.</td></tr>
            ) : (
              brands?.map(b => (
                <tr key={b.id} className="hover:bg-one-black/30 transition-colors">
                  <td className="p-4 font-medium text-white">{b.name}</td>
                  <td className="p-4 text-gray-500">{b.slug}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-one-red" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-one-charcoal border-white/10 text-white">
          <DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'New Brand'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label className="text-gray-300">Brand Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-one-black border-white/10 text-white" placeholder="e.g. Toyota" /></div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-white/20 text-white" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
