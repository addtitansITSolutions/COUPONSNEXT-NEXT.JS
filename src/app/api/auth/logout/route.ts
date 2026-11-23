// import { NextRequest, NextResponse } from "next/server";
// import { clearAuthCookie } from "@/lib/auth";
// import { handleApiError } from "@/lib/errors/handleApiError";

// export const runtime = "nodejs";

// export async function POST(request: NextRequest) {
//   try {
//     await clearAuthCookie();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Logout successful",
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     return handleApiError(error, request);
//   }
// }



import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie, getAuthUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-log";
import { handleApiError } from "@/lib/errors/handleApiError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Identify the user before clearing the authentication cookie
    const authUser = await getAuthUser();

    // Clear authentication cookie
    await clearAuthCookie();

    // Record logout only when a valid authenticated user exists
    if (authUser) {
      await createActivityLog({
        userId: authUser.userId,
        performedBy: authUser.userId,
        action: "USER_LOGOUT",
        description: "User logged out",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
