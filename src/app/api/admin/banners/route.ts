import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { createBannerSchema, bannerQuerySchema, } from "@/lib/validations/banner";
import { handleApiError } from "@/lib/errors/handleApiError";
import Banner from "@/models/Banner";
import Store from "@/models/Store";
import { ApiError } from "@/lib/errors/ApiError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validation = createBannerSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const bannerData = validation.data;
    await connectDB();
    // Confirm that the selected store exists.
    const storeExists = await Store.exists({ _id: bannerData.store });

    if (!storeExists) {
      throw new ApiError(
        404,
        "The selected store could not be found",
        "STORE_NOT_FOUND"
      );
    }

    const banner = await Banner.create(bannerData);
    return NextResponse.json(
      {
        success: true,
        message: "Banner created successfully",
        banner: {
          id: banner._id.toString(),
          title: banner.title,
          subtitle: banner.subtitle,
          desktopImage: banner.desktopImage,
          mobileImage: banner.mobileImage,
          store: banner.store.toString(),
          affiliateUrl: banner.affiliateUrl,
          country: banner.country,
          isActive: banner.isActive,
          sortOrder: banner.sortOrder,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = bannerQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!query.success) {
      throw query.error;
    }
    const {
      page,
      limit,
      search,
      store,
      isActive,
      country,
    } = query.data;
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subtitle: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (store) {
      filter.store = store;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (country) {
      filter.country = country;
    }

    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find(filter)
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("store", "name slug logo")
        .lean(),

      Banner.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        banners: banners.map((banner) => {
          const populatedStore = banner.store as unknown as {
            _id: { toString(): string };
            name: string;
            slug: string;
            logo?: string;
          } | null;

          return {
            id: banner._id.toString(),
            title: banner.title,
            subtitle: banner.subtitle,
            desktopImage: banner.desktopImage,
            mobileImage: banner.mobileImage,
            store: populatedStore
              ? {
                  id: populatedStore._id.toString(),
                  name: populatedStore.name,
                  slug: populatedStore.slug,
                  logo: populatedStore.logo,
                }
              : null,
            affiliateUrl: banner.affiliateUrl,
            country: banner.country,
            isActive: banner.isActive,
            sortOrder: banner.sortOrder,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
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