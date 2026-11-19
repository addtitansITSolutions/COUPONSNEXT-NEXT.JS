import BlogCard from "./BlogCard";
import type { BlogItem } from "./BlogsClient";

interface BlogGridProps {
  blogs: BlogItem[];
}

export default function BlogGrid({ blogs }: BlogGridProps) {
  if (!blogs.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}