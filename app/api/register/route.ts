import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { generateRegistrationCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;
    const area = formData.get("area") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const paymentName = formData.get("paymentName") as string;
    const paymentBank = formData.get("paymentBank") as string;
    const file = formData.get("paymentProof") as File | null;

    if (
      !name ||
      !gender ||
      !area ||
      !phone ||
      !email ||
      !paymentName ||
      !paymentBank ||
      !file
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert file to buffer and upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const paymentProofUrl = await uploadImageBuffer(buffer, file.type);

    // Generate unique code
    let registrationCode;
    let isUnique = false;
    while (!isUnique) {
      registrationCode = generateRegistrationCode();
      const existing = await Registration.findOne({ registrationCode });
      if (!existing) isUnique = true;
    }

    // Save Registration
    const registration = new Registration({
      name,
      gender,
      area,
      phone,
      email,
      paymentName,
      paymentBank,
      paymentProofUrl,
      registrationCode,
    });

    await registration.save();

    return NextResponse.json({ success: true, registrationCode });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
