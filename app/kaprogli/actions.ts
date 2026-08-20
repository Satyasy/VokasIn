"use server";

import { revalidatePath } from "next/cache";
import { toggleGapReviewed } from "@/lib/data-access";

export async function toggleGapReviewedAction(id: string) {
  toggleGapReviewed(id);
  revalidatePath("/", "layout");
}
