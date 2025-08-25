import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../lib/axios";
import { toast } from "react-toastify";
import axios from "axios";
import { debug } from "console";

export const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.message || error.message || "Something went wrong";
    console.error("Axios Error:", msg, error);
    toast.error(msg);
  } else if (error instanceof Error) {
    console.error("Generic Error:", error);
    toast.error(error.message);
  } else {
    console.error("Unknown Error:", error);
    toast.error("Something went wrong");
  }
};

// ====== Mutations ======
export const useLoginMutation = (role: "user" | "admin") =>
  useMutation({
    mutationKey: ["login", role],
    mutationFn: async () => {
      const res = await axiosClient.post("/api/login", { role });
      return res.data;
    },
    onError: handleError,
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const res = await axiosClient.post("/api/logout");
      return res.data;
    },
    onError: handleError,
  });

// ====== Queries ======
const axiosGet = async (url: string) => {
  try {
    const res = await axiosClient.get(url);
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const useMeQuery = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => axiosGet("/api/me"),
    enabled: false,
  });

export const usePublicQuery = () =>
  useQuery({
    queryKey: ["public"],
    queryFn: () => axiosGet("/api/public"),
    enabled: false,
  });

export const useAdminQuery = () =>
  useQuery({
    queryKey: ["admin"],
    queryFn: () => axiosGet("/api/admin"),
    enabled: false,
  });
