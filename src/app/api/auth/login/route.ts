import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { loginSchema } from "@/lib/validations/auth";
import { createToken } from "@/lib/auth";
import { ApiError } from "@/lib/errors/ApiError";
import { handleApiError } from "@/lib/errors/handleApiError";
import User from "@/models/User";
import { createActivityLog } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate login input
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw validation.error;
    }

    const { email, password } = validation.data;

    // Connect to MongoDB
    await connectDB();

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      throw new ApiError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS"
      );
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS"
      );
    }

    // Create JWT
    const token = createToken({
      userId: user._id.toString(),
      role: user.role,
    });


    // Record successful login
    await createActivityLog({
      userId: user._id,
      performedBy: user._id,
      action: "USER_LOGIN",
      description: "User logged in",
    });

    // Create response with safe user details
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Set secure HttpOnly cookie
    response.cookies.set("couponsnext_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return handleApiError(error, request);
  }
}