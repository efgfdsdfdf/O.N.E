import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import type { WebsiteSettings } from '@/types';

export function useSettings() {
  return useQuery<WebsiteSettings>({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
  });
}

export function useSetting(key: string) {
  const { data: settings, ...rest } = useSettings();
  return {
    ...rest,
    data: settings?.[key] || '',
  };
}
