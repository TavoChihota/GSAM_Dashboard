import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import ClientInformationCard from '@/Components/ClientInformationCard';
import ShareMovementCard from '@/Components/ShareMovementCard';
import FundsUnderManagementCard from '@/Components/FundsUnderManagementCard';

export default function Dashboard({
  filters = { value_date: new Date().toISOString().slice(0, 10), currency: 'USD' },
  clientDetails = [],
  shareMovement = [],
  fundsUnderManagement = { rows: [], sums: null },
}) {
  const handleTopFilterChange = (key) => (e) => {
    router.get('/dashboard', { ...filters, [key]: e.target.value }, { preserveState: true, preserveScroll: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Head title="Executive Dashboard" />
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="text-sm text-gray-600">Unified Portfolio Ledger</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Pipeline Engine Active
            </span>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">GSAM Executive Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time positions, client segmentation, and fund flows across the portfolio.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase block mb-1">Value Date</label>
              <input
                type="date"
                value={filters.value_date}
                onChange={handleTopFilterChange('value_date')}
                className="border border-gray-300 rounded-md text-sm px-2 py-1.5"
              />
            </div>
          </div>

          <div className="flex gap-6 flex-col lg:flex-row">
            <ClientInformationCard clientDetails={clientDetails} />
            <ShareMovementCard shareMovement={shareMovement} filters={filters} />
          </div>

          <FundsUnderManagementCard fundsUnderManagement={fundsUnderManagement} filters={filters} />
        </main>
      </div>
    </div>
  );
}
