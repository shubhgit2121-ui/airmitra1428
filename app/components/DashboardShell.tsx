import type { ReactNode } from "react";

export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
      <aside
        aria-label="Household profile"
        className="border-b border-line px-5 py-6 sm:px-8 lg:w-[300px] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-7 lg:py-9"
      >
        {sidebar}
      </aside>
      <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 sm:py-9 lg:px-10">
        {children}
      </main>
    </div>
  );
}
