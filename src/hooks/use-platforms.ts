import { trpc } from "@/lib/trpc";

export interface Platform {
  id: string;
  code: string;
  displayName: string;
  icon: string | null;
  color: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  metadata: string | null;
}

export function usePlatforms() {
  const { data: platforms = [], isLoading, error, refetch } = trpc.platform.getActive.useQuery();

  const getPlatformByCode = (code: string): Platform | undefined => {
    return platforms.find((p) => p.code === code);
  };

  const getPlatformColor = (code: string): string => {
    const platform = getPlatformByCode(code);
    return platform?.color ?? "#6B7280"; // default gray
  };

  const getPlatformDisplayName = (code: string): string => {
    const platform = getPlatformByCode(code);
    return platform?.displayName ?? code;
  };

  const getPlatformIcon = (code: string): string | null => {
    const platform = getPlatformByCode(code);
    return platform?.icon ?? null;
  };

  const getPlatformsByCategory = (category: string): Platform[] => {
    return platforms.filter((p) => p.category === category);
  };

  return {
    platforms,
    isLoading,
    error,
    refetch,
    getPlatformByCode,
    getPlatformColor,
    getPlatformDisplayName,
    getPlatformIcon,
    getPlatformsByCategory,
  };
}

export function useAllPlatforms() {
  const { data: platforms = [], isLoading, error, refetch } = trpc.platform.getAll.useQuery();

  return {
    platforms,
    isLoading,
    error,
    refetch,
  };
}
