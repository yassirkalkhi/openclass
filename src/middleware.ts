import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const authSecret = process.env.AUTH_SECRET
const secret = authSecret ? new TextEncoder().encode(authSecret) : null

const publicRoutes = ["/", "/login", "/register", "/temp-create-user"]

function getPostAuthRedirect(payload: {
  activeOrganizationId?: string
}): string {
  return payload.activeOrganizationId ? "/app" : "/organizations"
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  const url = req.nextUrl.clone()
  const path = url.pathname

  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  if (!token) {
    if (!isPublicRoute) {
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (!secret) {
    const response = NextResponse.redirect(new URL("/login?error=server_error", req.url))
    response.cookies.delete("token")
    return response
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    if (isPublicRoute) {
      url.pathname = getPostAuthRedirect({
        activeOrganizationId: payload.activeOrganizationId as string | undefined,
      })
      return NextResponse.redirect(url)
    }

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.id as string)
    if (payload.orgRole) {
      requestHeaders.set("x-user-org-role", payload.orgRole as string)
    }
    if (payload.activeOrganizationId) {
      requestHeaders.set("x-org-id", payload.activeOrganizationId as string)
    }

    if (path === "/") {
      url.pathname = getPostAuthRedirect({
        activeOrganizationId: payload.activeOrganizationId as string | undefined,
      })
      return NextResponse.redirect(url)
    }

    if (path.startsWith("/app") && !payload.activeOrganizationId) {
      url.pathname = "/organizations"
      return NextResponse.redirect(url)
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("token")
    return response
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
