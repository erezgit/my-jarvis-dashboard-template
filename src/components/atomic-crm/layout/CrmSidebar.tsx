import { Link, matchPath, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Home, Plug } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";
import { cn } from "@/lib/utils";
import { getTenantIdentity } from "@/lib/tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
};

// Template default nav — Welcome + Install MCP. Tenant assistants append
// their own pages here as they build them.
const navItems: NavItem[] = [
  { label: "Welcome", to: "/", icon: Home },
  { label: "Install MCP", to: "/install-mcp", icon: Plug },
];

function NavLink({ item }: { item: NavItem }) {
  const location = useLocation();
  const active =
    item.to === "/"
      ? location.pathname === "/"
      : !!matchPath(item.to + "/*", location.pathname);

  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <item.icon className="h-[18px] w-[18px]" />
      <span>{item.label}</span>
    </Link>
  );
}

export function CrmSidebar() {
  const { user, signOut } = useAuth();
  const { displayName: tenantDisplayName, initial: tenantInitial } =
    getTenantIdentity();

  const fullName = [user?.firstName, user?.lastName]
    .filter((v): v is string => Boolean(v))
    .join(" ");
  const displayName = fullName || user?.email || "User";
  const avatarUrl = user?.profilePictureUrl ?? undefined;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-svh w-56 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            {tenantInitial}
          </div>
          <span className="text-sm font-semibold">
            {tenantDisplayName} Dashboard
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="px-2 pb-3 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Avatar className="h-7 w-7">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
              </Avatar>
              <span className="truncate">{displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 me-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
