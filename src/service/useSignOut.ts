import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";

const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Revalidate useAuth
      toast.success("Signed out successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong while signing out.");
    },
  });
};

export default useSignOut;
