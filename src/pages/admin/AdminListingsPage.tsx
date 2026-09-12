import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Search, Plus, MoreVertical, Edit, 
  Trash2, Eye, Star, Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAdminListings } from '@/hooks/useListings';
import { listingService } from '@/services/listingService';
import { formatNaira } from '@/utils/currency';
import { formatRelativeDate } from '@/utils/helpers';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LISTING_TYPES } from '@/lib/constants';
import type { ListingFilters } from '@/types';

export default function AdminListingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    per_page: 12,
  });

  const { data, isLoading, refetch } = useAdminListings(filters);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, listing_type: value === 'all' ? undefined : value as any, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as any, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await listingService.deleteListing(id);
        toast({ title: 'Listing deleted successfully' });
        refetch();
      } catch (error) {
        toast({ title: 'Failed to delete listing', variant: 'destructive' });
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newListing = await listingService.duplicateListing(id);
      toast({ title: 'Listing duplicated successfully' });
      navigate(`/admin/listings/${newListing.id}/edit`);
    } catch (error) {
      toast({ title: 'Failed to duplicate listing', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (id: string, currentlyFeatured: boolean) => {
    try {
      await listingService.toggleFeatured(id, !currentlyFeatured);
      toast({ title: `Listing ${!currentlyFeatured ? 'featured' : 'unfeatured'}` });
      refetch();
    } catch (error) {
      toast({ title: 'Failed to update listing', variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await listingService.updateStatus(id, newStatus);
      toast({ title: `Status updated to ${newStatus}` });
      refetch();
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Listings</h1>
          <p className="text-gray-400">View, edit, and create inventory.</p>
        </div>
        <Link to="/admin/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-one-charcoal border border-white/10 rounded-xl p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search listings..." 
            value={filters.search || ''}
            onChange={handleSearch}
            className="pl-9 bg-one-black border-white/10 text-white h-10"
          />
        </div>
        <div className="w-[180px]">
          <Select value={filters.listing_type || 'all'} onValueChange={handleTypeChange}>
            <SelectTrigger className="bg-one-black border-white/10 text-white h-10">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-one-charcoal border-white/10 text-white">
              <SelectItem value="all">All Types</SelectItem>
              {LISTING_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[180px]">
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-one-black border-white/10 text-white h-10">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-one-charcoal border-white/10 text-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-one-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-one-black/50 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Listing</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No listings found.</td>
                </tr>
              ) : (
                data?.data.map((listing) => (
                  <tr key={listing.id} className="hover:bg-one-black/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-one-black shrink-0 overflow-hidden relative">
                          {listing.images?.[0] ? (
                            <img src={listingService.getImageUrl(listing.images[0].storage_path)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-6 h-6 m-3 text-gray-600" />
                          )}
                          {listing.featured && (
                            <div className="absolute top-0 right-0 bg-one-red text-white p-0.5 rounded-bl">
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-white truncate">{listing.title}</p>
                          <p className="text-xs text-gray-500 truncate">{listing.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{listing.listing_type.replace('_', ' ')}</td>
                    <td className="p-4 text-white font-medium">{formatNaira(listing.price)}</td>
                    <td className="p-4">
                      <Badge variant={
                        listing.status === 'published' ? 'success' :
                        listing.status === 'sold' ? 'sold' :
                        listing.status === 'out_of_stock' ? 'warning' :
                        'secondary'
                      } className="uppercase text-[10px]">
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">{listing.views_count || 0}</td>
                    <td className="p-4 text-xs text-gray-500">{formatRelativeDate(listing.created_at || '')}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-one-charcoal border-white/10 text-white">
                          <Link to={`/admin/listings/${listing.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          {listing.status === 'published' && (
                            <Link to={`/${listing.listing_type === 'vehicle' ? 'vehicles' : 'products'}/${listing.slug}`} target="_blank">
                              <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                                <Eye className="h-4 w-4 mr-2" /> View Public
                              </DropdownMenuItem>
                            </Link>
                          )}
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={() => handleDuplicate(listing.id)}>
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={() => handleToggleFeatured(listing.id, !!listing.featured)}>
                            <Star className="h-4 w-4 mr-2" /> {listing.featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <div className="h-px bg-white/10 my-1" />
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={() => handleStatusUpdate(listing.id, listing.status === 'published' ? 'draft' : 'published')}>
                            {listing.status === 'published' ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          {listing.status !== 'sold' && (
                            <DropdownMenuItem className="cursor-pointer text-green-400 hover:bg-green-400/10" onClick={() => handleStatusUpdate(listing.id, 'sold')}>
                              Mark as Sold
                            </DropdownMenuItem>
                          )}
                          <div className="h-px bg-white/10 my-1" />
                          <DropdownMenuItem className="cursor-pointer text-one-red hover:bg-one-red/10" onClick={() => handleDelete(listing.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        {data && data.total_pages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
            <span>Showing {((filters.page || 1) - 1) * (filters.per_page || 12) + 1} to Math.min((filters.page || 1) * (filters.per_page || 12), data.count) of {data.count}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/10 text-white h-8"
                disabled={(filters.page || 1) <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/10 text-white h-8"
                disabled={(filters.page || 1) >= data.total_pages}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
