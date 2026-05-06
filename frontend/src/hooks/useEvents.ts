import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";


export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => apiFetch("/events"),
  });
};