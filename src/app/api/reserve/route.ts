import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, shoeId, shoeName, size, note, city } = body;

    // Basic server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "A valid phone number is required." },
        { status: 400 }
      );
    }

    if (!shoeName) {
      return NextResponse.json(
        { error: "Please select a shoe silhouette." },
        { status: 400 }
      );
    }

    if (!size || isNaN(Number(size))) {
      return NextResponse.json(
        { error: "Please select a valid UK/India shoe size." },
        { status: 400 }
      );
    }

    // Generate unique reservation ID
    const reservationId = `AUR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const reservationRecord = {
      reservationId,
      timestamp: new Date().toISOString(),
      client: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
      order: {
        shoeId: shoeId || "bespoke",
        shoeName: shoeName.trim(),
        size: Number(size),
        sizeStandard: "UK/India",
        note: note ? note.trim() : "Standard atelier fitting",
        boutiqueCity: city || "Mumbai (Kala Ghoda)",
      },
    };

    // Log the request to server console as requested
    console.log("=================================================");
    console.log("⚜️ [MAISON AURELLE] NEW BESPOKE RESERVATION LOGGED");
    console.log("Reservation ID :", reservationRecord.reservationId);
    console.log("Timestamp      :", reservationRecord.timestamp);
    console.log("Client Name    :", reservationRecord.client.name);
    console.log("Contact        :", `${reservationRecord.client.email} | ${reservationRecord.client.phone}`);
    console.log("Silhouette     :", reservationRecord.order.shoeName);
    console.log("Size           :", `UK/IND ${reservationRecord.order.size}`);
    console.log("Boutique       :", reservationRecord.order.boutiqueCity);
    if (reservationRecord.order.note) {
      console.log("Client Note    :", reservationRecord.order.note);
    }
    console.log("=================================================");

    return NextResponse.json({
      success: true,
      message: "Atelier fitting reservation successfully confirmed.",
      reservationId,
      data: {
        name: reservationRecord.client.name,
        email: reservationRecord.client.email,
        phone: reservationRecord.client.phone,
        shoe: reservationRecord.order.shoeName,
        size: reservationRecord.order.size,
        note: reservationRecord.order.note,
        boutiqueCity: reservationRecord.order.boutiqueCity,
      },
    });
  } catch (error) {
    console.error("[Maison Aurelle Reservation Error]:", error);
    return NextResponse.json(
      { error: "Unable to process reservation request at this time." },
      { status: 500 }
    );
  }
}
