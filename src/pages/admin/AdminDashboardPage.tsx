import { Link } from 'react-router-dom';
import { 
  Car, Eye, MousePointerClick, TrendingUp, Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useListingStats, useRecentListings } from '@/hooks/useListings';
import { formatNaira } from '@/utils/currency';
import { formatRelativeDate } from '@/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { enquiryService } from '@/services/enquiryService';
import { analyticsService } from '@/services/analyticsService';
import { listingService } from '@/services/listingService';

export default function AdminDashboardPage() {
  const { data: stats } = useListingStats();
  const { data: recentListings } = useRecentListings(5);
  
  const { data: recentEnquiries } = useQuery({
    queryKey: ['recent-enquiries'],
    queryFn: () => enquiryService.getAll(),
    select: (data) => data.slice(0, 5),
  });

  const { data: analyticsCounts } = useQuery({
    queryKey: ['analytics-counts'],
    queryFn: () => analyticsService.getEventCounts(),
  });

  const viewsCount = stats?.total_views || 0;
  const siteVisits = analyticsCounts?.['site_visit'] || 0;
  const whatsappClicks = analyticsCounts?.['whatsapp_click'] || 0;
  const ctr = viewsCount > 0 ? ((whatsappClicks / viewsCount) * 100).toFixed(1) : '0.0';

  const statCards = [
    {
      title: 'Total Active Listings',
      value: stats?.available || 0,
      icon: <Car className="h-6 w-6 text-blue-500" />,
      desc: `${stats?.drafts || 0} drafts`,
    },
    {
      title: 'Site Visitors',
      value: siteVisits.toLocaleString(),
      icon: <Users className="h-6 w-6 text-purple-500" />,
      desc: 'Unique browsers per 24h',
    },
    {
      title: 'Listing Detail Views',
      value: viewsCount.toLocaleString(),
      icon: <Eye className="h-6 w-6 text-cyan-500" />,
      desc: 'Total listing detail page views',
    },
    {
      title: 'WhatsApp Clicks',
      value: whatsappClicks.toLocaleString(),
      icon: <MousePointerClick className="h-6 w-6 text-green-500" />,
      desc: `${ctr}% Conversion Rate`,
    },
    {
      title: 'Items Sold',
      value: stats?.sold || 0,
      icon: <TrendingUp className="h-6 w-6 text-one-red" />,
      desc: 'Successfully closed',
    },
  ];

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back. Here's what's happening today.</p>
        </div>
        <Link to="/admin/listings/new">
          <Button className="gap-2">
            <Car className="h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="min-w-0 bg-one-charcoal border-white/10 p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex min-w-0 justify-between items-start gap-3 mb-4">
              <div className="p-2 bg-one-black rounded-lg">{stat.icon}</div>
              <span className="min-w-0 text-right text-sm font-medium text-gray-400">{stat.title}</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <Card className="min-w-0 bg-one-charcoal border-white/10 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recently Added</h2>
            <Link to="/admin/listings" className="text-sm text-one-red hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentListings?.length === 0 ? (
              <p className="text-gray-500 text-sm">No listings found.</p>
            ) : (
              recentListings?.map(listing => (
                <div key={listing.id} className="flex min-w-0 items-center gap-3 sm:gap-4 p-3 rounded-lg bg-one-black/50 border border-white/5">
                  <div className="w-12 h-12 rounded bg-one-charcoal shrink-0 overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listingService.getImageUrl(listing.images[0].storage_path)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-6 h-6 m-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{listing.title}</p>
                    <p className="text-xs text-gray-400">{formatNaira(listing.price)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                      listing.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      listing.status === 'sold' ? 'bg-one-red/20 text-one-red' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {listing.status.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">{formatRelativeDate(listing.created_at || '')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Enquiries */}
        <Card className="min-w-0 bg-one-charcoal border-white/10 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-sm text-one-red hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentEnquiries?.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent enquiries.</p>
            ) : (
              recentEnquiries?.map(enq => (
                <div key={enq.id} className="p-3 rounded-lg bg-one-black/50 border border-white/5 space-y-2">
                  <div className="flex min-w-0 justify-between items-start gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-white">
                      {enq.status === 'new' && <span className="w-2 h-2 rounded-full bg-one-red" />}
                      <span className="min-w-0 truncate">{enq.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {formatRelativeDate(enq.created_at || '')}
                    </span>
                  </div>
                  {enq.listing && (
                    <Link to={`/admin/listings/${enq.listing.id}/edit`} className="text-xs text-one-red hover:underline block truncate">
                      Re: {enq.listing.title}
                    </Link>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-2">{enq.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
