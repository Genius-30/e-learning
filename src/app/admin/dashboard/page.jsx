import StatsCards from "./components/StatsCards";
import RevenueChart from "./components/RevenueChart";
import RecentSales from "./components/RecentSales";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Top Stats Cards */}
      <StatsCards />

      {/* Charts Section*/}
      <div className="w-full flex flex-col md:flex-row gap-6">
        <RevenueChart />
        <RecentSales />
      </div>
    </div>
  );
}
