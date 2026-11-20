
import SearchPageClient from "@/components/public/search/SearchPageClient";
import PublicHeader from "@/components/public/layout/PublicHeader";
import PublicFooter from "@/components/public/layout/PublicFooter";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q = "" } = await searchParams;

  return (
    <>
      <PublicHeader />

      <SearchPageClient initialQuery={q} />

      <PublicFooter />
    </>
  );
}
