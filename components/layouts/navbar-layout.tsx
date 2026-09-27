// frontend/src/components/layouts/navbar-layout.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BellIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
  School2Icon
} from "lucide-react";
import * as React from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students", href: "/students" },
  { label: "Organizations", href: "/organizations" },
];

function NavUser({
                   user,
                   logout
                 }: {
  user: User & { name?: string, avatar?: string },
  logout: () => void
}) {
  const name = user.user_metadata?.full_name ?? user.email ?? "Account";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      >
        <Avatar className="size-8 rounded-lg grayscale">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs text-foreground/70">
                {user.email}
              </span>
        </div>
        <EllipsisVerticalIcon className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CircleUserRoundIcon
            />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon
            />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon
            />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon
          />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SigninButton() {
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
  }, [supabase.auth]);

  if (user) {
    return (
      <NavUser
        user={user}
        logout={async () => {
          await signout();
        }}
      />
    );
  }

  return (
    <Button variant="outline" onClick={() => router.push("/signin")}>
      Login
    </Button>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-8xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <School2Icon className="size-6!" />
          MSU-IIT OMS
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SigninButton />
      </div>
    </header>
  );
}