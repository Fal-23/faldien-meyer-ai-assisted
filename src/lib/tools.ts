import { Mail, FileText, CalendarClock, Telescope, MessagesSquare, LayoutDashboard } from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/notes", label: "Notes Summarizer", icon: FileText },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research", icon: Telescope },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
] as const;

export const tools = [
  {
    to: "/email",
    name: "Smart Email Generator",
    description: "Turn a few bullet points into a polished, on-tone email draft.",
    icon: Mail,
    tint: "blue" as const,
  },
  {
    to: "/notes",
    name: "Meeting Notes Summarizer",
    description: "Summaries, action items, decisions and deadlines from raw notes.",
    icon: FileText,
    tint: "teal" as const,
  },
  {
    to: "/planner",
    name: "AI Task Planner",
    description: "Rank your tasks and lay them out across a focused day or week.",
    icon: CalendarClock,
    tint: "blue" as const,
  },
  {
    to: "/research",
    name: "AI Research Assistant",
    description: "Condense any topic or article into insights and recommendations.",
    icon: Telescope,
    tint: "teal" as const,
  },
  {
    to: "/chat",
    name: "AI Chat",
    description: "Ask anything — open-ended help for everyday workplace questions.",
    icon: MessagesSquare,
    tint: "blue" as const,
  },
] as const;
