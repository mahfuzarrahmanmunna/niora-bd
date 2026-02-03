// src/app/api/scrapers/[id]/results/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const collection = await dbConnect("scrapers");

    const scraper = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { results: 1, logs: 1 } },
    );

    if (!scraper) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      results: scraper.results || [],
      logs: scraper.logs || [],
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch results" },
      { status: 500 },
    );
  }
}
