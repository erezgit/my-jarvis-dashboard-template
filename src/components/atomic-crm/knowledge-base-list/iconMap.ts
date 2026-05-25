import {
  Activity, Archive, ArrowRightLeft, BookOpen, Boxes, Brain, Calendar,
  ClipboardList, Cog, Compass, Cpu, FileText, Film, Flag, GitBranch,
  GitCompare, Globe, Handshake, Layers, LayoutDashboard, Library, ListChecks,
  ListTodo, Map, Megaphone, MessageSquare, Mic, Network, Newspaper, PartyPopper,
  Plug, Presentation, Rocket, ShieldCheck, Smartphone, Sparkles, TerminalSquare,
  TrendingUp, UserCog, Users, Workflow, Folder, type LucideIcon,
} from "lucide-react";

// MJOS-143 — data-driven KB icons.
//
// The DB stores an icon NAME (a string) on page_content.nav_icon and
// nav_folders.icon. This map resolves that string to a bundled lucide
// component. This is the ONE residual code touch for KB nav: adding a brand
// new icon to the palette = one line here. Reusing an existing icon (the
// common case) is a pure DB change, no code. Unknown / missing names fall back.
export const KB_ICONS: Record<string, LucideIcon> = {
  Activity, Archive, ArrowRightLeft, BookOpen, Boxes, Brain, Calendar,
  ClipboardList, Cog, Compass, Cpu, FileText, Film, Flag, GitBranch,
  GitCompare, Globe, Handshake, Layers, LayoutDashboard, Library, ListChecks,
  ListTodo, Map, Megaphone, MessageSquare, Mic, Network, Newspaper, PartyPopper,
  Plug, Presentation, Rocket, ShieldCheck, Smartphone, Sparkles, TerminalSquare,
  TrendingUp, UserCog, UsersIcon: Users, Workflow, Folder,
};

export function resolveIcon(
  name: string | null | undefined,
  fallback: LucideIcon = FileText,
): LucideIcon {
  if (name && KB_ICONS[name]) return KB_ICONS[name];
  return fallback;
}
