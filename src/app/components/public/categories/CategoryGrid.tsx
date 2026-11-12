
import CategoryCard, {
  type CategoryItem,
} from "@/components/public/categories/CategoryCard";

interface CategoryGridProps {
  categories: CategoryItem[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
