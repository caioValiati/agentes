import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const Header = ({ title, description, action }: HeaderProps) => {
  return (
    <div className="border-b border-border bg-card h-28">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  );
};
