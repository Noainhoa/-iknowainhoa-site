import LatestBlogUpdates from "@/components/LatestBlogUpdates";

export default async function BlogIndex() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>Blog</h1>

      <LatestBlogUpdates
        limit={3}
        title="Latest"
        viewAllLabel="More posts"
        expandable
      />
    </main>
  );
}
