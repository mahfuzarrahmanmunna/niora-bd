import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const collection = await dbConnect("products");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 12; // Default to 10 products

    // --- POPULARITY LOGIC ---
    // Since specific sales data isn't visible, we sort by:
    // 1. Creation Date (Newest) - acts as "Trending"
    // 2. Rating (Highest)
    const sortCriteria = { createdAt: -1, rating: -1 };

    try {
      const products = await collection
        .find({}) // No category filter, fetch from all
        .sort(sortCriteria)
        .limit(limit)
        .toArray();

      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch popular products: " + error.message,
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
