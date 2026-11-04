
import StoreCard from "@/components/public/stores/StoreCard";
import type { StoreItem } from "@/components/public/stores/StoresClient";

interface StoreGridProps {
  stores: StoreItem[];
  loading: boolean;
}

function StoreCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
      <div className="h-20 w-20 rounded-2xl bg-gray-100" />

      <div className="mt-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-gray-100" />
        <div className="h-4 w-1/3 rounded bg-gray-100" />
        <div className="mt-4 h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-4/5 rounded bg-gray-100" />

        <div className="flex justify-between pt-5">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function StoreGrid({
  stores,
  loading,
}: StoreGridProps) {
  if (loading && stores.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StoreCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/40" />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
