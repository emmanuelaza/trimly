import { getBarbershopId as getLibBarbershopId } from "@/lib/getBarbershopId";

export async function getBarbershopId(): Promise<string | null> {
  try {
    return await getLibBarbershopId();
  } catch (error) {
    console.error("Error in getBarbershopId wrapper:", error);
    return null;
  }
}
