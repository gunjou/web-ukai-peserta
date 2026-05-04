import DashboardSidebar from "./dashboard-sidebar";
import DashboardNavbar from "./dashboard-navbar";
import MobileBottomNav from "./mobile-bottom-nav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex">
        <DashboardSidebar />
      </div>

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        <DashboardNavbar />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
