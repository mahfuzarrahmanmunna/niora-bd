import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const collection = await dbConnect("products");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    // FIX: Increased default limit from 10 to 50
    const limit = parseInt(searchParams.get("limit")) || 5000;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query object
    const query = {};

    // Add category filter if provided
    if (category && category !== "all") {
      query.category = category;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    try {
      // Count total documents for pagination info
      const total = await collection.countDocuments(query);

      // Fetch products with pagination and sorting
      const products = await collection
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .toArray();

      return NextResponse.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch products: " + error.message,
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

// POST: Add a new product (Includes Shipping)
export async function POST(request) {
  try {
    const collection = await dbConnect("products");
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Prepare the product document
    const newProduct = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure shipping structure exists even if empty
      shipping: body.shipping || {
        insideDhaka: 0,
        outsideDhaka: 0,
      },
    };

    const result = await collection.insertOne(newProduct);

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        data: { ...newProduct, _id: result.insertedId },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add product" },
      { status: 500 },
    );
  }
}
