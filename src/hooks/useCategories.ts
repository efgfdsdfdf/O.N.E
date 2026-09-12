import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAll(),
    staleTime: 30 * 60 * 1000,
  });
}
