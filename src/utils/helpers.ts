export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateString);
}

export function formatMileage(km: number | undefined): string {
  if (!km) return '';
  return `${km.toLocaleString('en-NG')} km`;
}

export function getConditionLabel(condition: string | null): string {
  const labels: Record<string, string> = {
    new: 'Brand New',
    foreign_used: 'Foreign Used',
    nigerian_used: 'Nigerian Used',
    refurbished: 'Refurbished',
  };
  return condition ? labels[condition] || condition : '';
}

export function getListingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    vehicle: 'Vehicle',
    accessory: 'Accessory',
    spare_part: 'Spare Part',
    tyre: 'Tyre',
    rim: 'Rim',
    motorcycle: 'Motorcycle',
    car_care: 'Car Care',
    tool: 'Tool',
    other: 'Other',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    sold: 'Sold',
    archived: 'Archived',
    out_of_stock: 'Out of Stock',
  };
  return labels[status] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
