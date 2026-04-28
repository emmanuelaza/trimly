import { getSupabaseAdmin } from "@/lib/supabase/serviceRole";

export default async function DebugPage() {
  const supabase = getSupabaseAdmin();
  
  // Try to select slug from barbershops
  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .limit(1);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Debug DB Schema</h1>
      <pre className="bg-gray-100 p-4 mt-4 rounded">
        {JSON.stringify({ error, columns: data ? Object.keys(data[0] || {}) : [] }, null, 2)}
      </pre>
    </div>
  );
}
