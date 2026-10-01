import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { signupSchema } from "@/lib/validations/auth";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import User from "@/models/User";
import { z } from "zod";

export const runtime = "nodejs";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     // Validate signup data
//     const validation = signupSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid signup details",
//           errors: z.flattenError(validation.error).fieldErrors,
//         },
//         { status: 400 }
//       );
//     }

//     const { name, email, password } = validation.data;

//     // Connect to MongoDB
//     await connectDB();

//     // Check whether the email is already registered
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An account with this email already exists",
//         },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Always create a normal user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "user",
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Account created successfully",
//         user: {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     // Handle duplicate email if two requests arrive simultaneously
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       error.code === 11000
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An account with this email already exists",
//         },
//         { status: 409 }
//       );
//     }

//     console.error("Signup error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Something went wrong. Please try again.",
//       },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const { name, email, password } = validation.data;

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(
        409,
        "An account with this email already exists",
        "EMAIL_ALREADY_EXISTS"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}