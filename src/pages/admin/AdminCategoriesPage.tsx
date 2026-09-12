import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { categoryService } from '@/services/categoryService';
import type { Category, CreateCategoryInput } from '@/types';

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CreateCategoryInput>({ name: '', description: '', icon: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', icon: '', sort_order: (categories?.length || 0) + 1 }); setDialogOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', sort_order: cat.sort_order }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoryService.update(editing.id, form);
        toast({ title: 'Category updated' });
      } else {
        await categoryService.create(form);
        toast({ title: 'Category created' });
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Listings in this category will be unlinked.')) return;
    try {
      await categoryService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted' });
    } catch (e: any) { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400">Manage product categories for your inventory.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <div className="max-w-full bg-one-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="max-w-full overflow-x-auto">
        <table className="min-w-[560px] w-full text-left text-sm">
          <thead className="bg-one-black/50 text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Icon</th>
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories?.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500"><FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-600" />No categories yet.</td></tr>
            ) : (
              categories?.map(cat => (
                <tr key={cat.id} className="hover:bg-one-black/30 transition-colors">
                  <td className="p-4 font-medium text-white">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4 text-gray-500">{cat.icon || '—'}</td>
                  <td className="p-4">{cat.sort_order}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => openEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-one-red" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-one-charcoal border-white/10 text-white">
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label className="text-gray-300">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-one-black border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Description</Label><Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-one-black border-white/10 text-white" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-gray-300">Icon (Lucide name)</Label><Input value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} className="bg-one-black border-white/10 text-white" placeholder="e.g. car" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Sort Order</Label><Input type="number" value={form.sort_order || 0} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="bg-one-black border-white/10 text-white" /></div>
            </div>
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
