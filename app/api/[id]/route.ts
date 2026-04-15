import { NextRequest, NextResponse } from "next/server";

// Allow admins to edit products 
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // ...
}