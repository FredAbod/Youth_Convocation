import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function GET() {
  try {
    await dbConnect();

    // Sort by createdAt descending
    const registrations = await Registration.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error("Fetch Registrations Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
