import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  HandHelping,
  PhoneCall,
  IndianRupee
} from 'lucide-react';

// Menu items based on the flow diagrams
const menuItems = [
  { title: "Dashboard", path: "/admin", icon: Home },
  { title: "User Management", path: "/admin/users", icon: Users },
  { title: "Events", path: "/admin/events", icon: Calendar },
  { title: "Services", path: "/admin/services", icon: HandHelping },
  { title: "Education", path: "/admin/education", icon: BookOpen },
  { title: "Volunteering", path: "/admin/volunteering", icon: HandHelping },
  { title: "Donations", path: "/admin/donations", icon: IndianRupee },
];

const AdminSidebar = () => {
  return (
    <Sidebar className="w-64 lg:w-64">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <h1 className="text-lg lg:text-xl font-semibold tracking-tight truncate">Admin Panel</h1>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-sidebar-accent text-primary font-medium' : 'hover:bg-sidebar-accent/50'}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
