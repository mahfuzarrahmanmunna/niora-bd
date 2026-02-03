// src/app/api/scrapers/[id]/logs/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const collection = await dbConnect("scrapers");

    const scraper = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { logs: 1 } },
    );

    if (!scraper) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      logs: scraper.logs || [],
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
