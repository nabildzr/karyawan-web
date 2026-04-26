// * Hook untuk helpdesk admin dashboard.

import { useQuery } from "@tanstack/react-query";
import { helpdeskService } from "../services/helpdesk.service";

export function useHelpdeskDashboard() {
  return useQuery({
    queryKey: ["helpdesk", "dashboard"],
    queryFn: () => helpdeskService.getDashboard(),
    staleTime: 60_000,  // refresh tiap 1 menit
  });
}
