import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  hasBorder?: boolean;
  sticky?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  rightContent,
  hasBorder = false,
  sticky = false,
}: PageHeaderProps) {
  const borderClass = hasBorder ? "border-b" : "";
  const stickyClass = sticky ? "sticky top-[73px] z-10" : "";
  
  return (
    <div className={`bg-background ${borderClass} ${stickyClass}`}>
      <div className="container mx-auto px-4 pt-8 pb-8 max-w-7xl">
        <div className="flex justify-between items-start">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {subtitle && (
              <p className="text-md text-muted-foreground max-w-4xl">
                {subtitle}
              </p>
            )}
          </div>
          {rightContent && (
            <div className="text-sm text-muted-foreground">{rightContent}</div>
          )}
        </div>
      </div>
    </div>
  );
}

