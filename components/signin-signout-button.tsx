"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import {NavUser} from "@/components/nav-user";
import { User } from "@supabase/supabase-js";

const SigninButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user) {
    return (
      <NavUser
        user={user}
        logoutAction={async () => {
          await signout();
          setUser(null);
        }}
      />
    );
  }
  return (
    <Button
      variant="outline"
      onClick={async () => {
        router.push("/signin");
      }}
    >
      Login
    </Button>
  );
};

export default SigninButton;