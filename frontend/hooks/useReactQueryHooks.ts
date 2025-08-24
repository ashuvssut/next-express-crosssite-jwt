import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../lib/api";

// ====== Mutations ======
export const useLoginMutation = (role: "user" | "admin") =>
  useMutation({
    mutationKey: ["login", role],
    mutationFn: async () => {
      const res = await axiosClient.post("/login", { role });
      return res.data;
    },
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const res = await axiosClient.post("/logout");
      return res.data;
    },
  });

// ====== Queries ======
export const useMeQuery = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await axiosClient.get("/me");
      return res.data;
    },
    enabled: false,
  });

export const usePublicQuery = () =>
  useQuery({
    queryKey: ["public"],
    queryFn: async () => {
      const res = await axiosClient.get("/public");
      return res.data;
    },
    enabled: false,
  });

export const useAdminQuery = () =>
  useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin");
      return res.data;
    },
    enabled: false,
  });
