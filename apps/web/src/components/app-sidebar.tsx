import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconShield,
  IconUser,
  IconDeviceDesktop,
  IconKey,
} from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/hooks/use-auth"
import { Role } from "@/types/auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === Role.ADMIN

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Profile",
      url: "/me",
      icon: IconUser,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: IconDeviceDesktop,
    },
    {
      title: "Passkeys",
      url: "/passkeys",
      icon: IconKey,
    },
    ...(isAdmin
      ? [
          {
            title: "User Management",
            url: "/admin/users",
            icon: IconShield,
          },
        ]
      : []),
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ]

  const sidebarUser = user
    ? {
        name: user.name || "User",
        email: user.email,
        avatar: user.picture || undefined,
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: undefined,
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">OAuth App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
