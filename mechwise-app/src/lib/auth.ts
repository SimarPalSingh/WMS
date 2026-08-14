import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mechwise-super-secret-key-australia-2026"
)

export interface UserSession {
  userId: string
  workshopId: string
  role: string
  email: string
  displayName: string
}

export async function signSessionToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as UserSession
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("mechwise_session")?.value
  if (!token) {
    // Default fallback for single-workshop demo development
    return {
      userId: "usr-01",
      workshopId: "dhalla-auto-nsw",
      role: "Owner",
      email: "tinku@dhalla.com.au",
      displayName: "Tinku Dhalla",
    }
  }
  return await verifySessionToken(token)
}
