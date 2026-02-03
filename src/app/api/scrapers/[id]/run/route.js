// src/app/api/scrapers/[id]/run/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { runScraper } from "@/lib/scraperService";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const collection = await dbConnect("scrapers");

    // Get scraper configuration
    const scraper = await collection.findOne({ _id: new ObjectId(id) });

    if (!scraper) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    // Run the scraper
    const { results, logs } = await runScraper(scraper);

    // Update scraper with results and logs
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastRun: new Date(),
          results: results,
          logs: logs,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Scraper executed successfully",
      results,
      logs,
    });
  } catch (error) {
    console.error("Error running scraper:", error);

    // Log the error
    const collection = await dbConnect("scrapers");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          logs: {
            timestamp: new Date(),
            status: "error",
            message: error.message,
          },
        },
      },
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to run scraper",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
