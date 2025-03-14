import { useQuery } from "@tanstack/react-query";
import supabase from "../supabaseClient";

const fetchUser = async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    return { user: null, role: null };
  }

  const user = sessionData.session.user;

  // Fetch user role from the database
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError) {
    console.error("Error fetching user role:", roleError.message);
    return { user, role: null };
  }

  return { user, role: roleData?.role || null };
};

const useAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
  });
};

export default useAuth;
