import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function GET(request: Request) {
  // We call deleteSession which uses next/headers cookies()
  // Wait, deleteSession uses cookies().delete(), which IS allowed in Route Handlers!
  await deleteSession();
  
  // Also delete it directly from response to be safe
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("auth-token");
  
  return response;
}
