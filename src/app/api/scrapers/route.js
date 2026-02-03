// src/app/api/scrapers/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
  try {
    const collection = await dbConnect("scrapers");
    const scrapers = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: scrapers,
    });
  } catch (error) {
    console.error("Error fetching scrapers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch scrapers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await dbConnect("scrapers");

    const newScraper = {
      ...body,
      createdAt: new Date(),
      lastRun: null,
      results: [],
      logs: [],
    };

    const result = await collection.insertOne(newScraper);

    return NextResponse.json({
      success: true,
      data: { ...newScraper, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating scraper:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create scraper" },
      { status: 500 },
    );
  }
}
