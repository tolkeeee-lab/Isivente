import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Isivente",
    timestamp: new Date().toISOString(),
  });
}
