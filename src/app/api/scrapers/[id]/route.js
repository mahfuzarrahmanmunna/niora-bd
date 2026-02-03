// src/app/api/scrapers/[id]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { runScraper } from "@/lib/scraperService";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const collection = await dbConnect("scrapers");

    const scraper = await collection.findOne({ _id: new ObjectId(id) });

    if (!scraper) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: scraper,
    });
  } catch (error) {
    console.error("Error fetching scraper:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch scraper" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const collection = await dbConnect("scrapers");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Scraper updated successfully",
    });
  } catch (error) {
    console.error("Error updating scraper:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update scraper" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const collection = await dbConnect("scrapers");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Scraper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Scraper deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scraper:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete scraper" },
      { status: 500 },
    );
  }
}
