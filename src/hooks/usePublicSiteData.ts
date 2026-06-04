import { useQuery } from "@tanstack/react-query";
import { getPublicSiteData } from "@/api/siteDataApi";

export const publicSiteDataQueryKey = ["public", "site-data"] as const;

export const usePublicSiteData = () => {
  return useQuery({
    queryKey: publicSiteDataQueryKey,
    queryFn: () => getPublicSiteData(),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};
