import { NextResponse } from "next/server";

type ApiHandlerContext = {
  params?: Record<string, string>;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiUnauthorized(message = "Unauthorized") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Forbidden") {
  return apiError(message, 403);
}

export function apiNotFound(message = "Not found") {
  return apiError(message, 404);
}

export function apiServerError(message = "Internal server error") {
  return apiError(message, 500);
}

export function paginate(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function setPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
