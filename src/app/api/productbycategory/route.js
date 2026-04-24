import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const collection = await dbConnect("products");

    // Aggregation Pipeline to group products by category and limit to 4 per group
    const pipeline = [
      // 1. Sort products by creation date (newest first)
      // You can change 'createdAt' to 'price' or 'sales' if you prefer a different "Top 4" logic
      { $sort: { createdAt: -1 } },

      // 2. Group by the 'category' field
      {
        $group: {
          _id: "$category", // The unique key will be the category name
          products: { $push: "$$ROOT" }, // Push the entire product document into an array
        },
      },

      // 3. Project (format) the results
      {
        $project: {
          _id: 0, // Exclude the default mongo _id for the group
          category: "$_id", // Rename _id to 'category'
          // Slice the array to only keep the first 4 items
          products: { $slice: ["$products", 8] },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    return NextResponse.json({
      success: true,
      data: result, // Returns array: [{ category: "Shoes", products: [...] }, ...]
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
