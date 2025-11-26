import {
  FileText,
  Users,
  Tag,
  FileBarChart,
  Upload,
  Search,
  Brain,
} from "lucide-react";
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border h-28">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              AgriNF Analyzer
            </h1>
            <p className="text-xs text-sidebar-foreground/70">
              Análise inteligente de notas fiscais
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload de Nota</span>
        </NavLink>

        <NavLink
          to="/movimentos"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <FileBarChart className="w-5 h-5" />
          <span className="font-medium">Movimentos</span>
        </NavLink>

        <NavLink
          to="/pessoas"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Pessoas</span>
        </NavLink>

        <NavLink
          to="/classificacoes"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <Tag className="w-5 h-5" />
          <span className="font-medium">Classificações</span>
        </NavLink>

        <NavLink
          to="/rag"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <Brain className="w-5 h-5" />
          <span className="font-medium">RAG</span>
        </NavLink>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border/40">
        <div className="text-xs text-sidebar text-center">
          Powered by Gemini AI
        </div>
      </div>
    </aside>
  );
};
