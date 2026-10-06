import { redirect } from "next/navigation";

// Category page just delegates to the shop page with category filter applied
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  redirect(`/shop?category=${category}`);
}
