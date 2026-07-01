import { afterEach, describe, expect, mock, test } from "bun:test"

const originalFetch = globalThis.fetch
const originalGoogleKey = process.env.GOOGLE_PLACES_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalGoogleKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY
  else process.env.GOOGLE_PLACES_API_KEY = originalGoogleKey
})

function photoRequest(query: string): Request {
  return new Request(`http://localhost/api/grader/place-photo?${query}`)
}

describe("GET /api/grader/place-photo", () => {
  test("redirects to the resolved Google photo URI without exposing the API key to the client", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-google-key"

    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const url = new URL(String(input))

      expect(url.pathname).toBe("/v1/places/google-place-123/photos/photo-abc/media")
      expect(url.searchParams.get("key")).toBe("test-google-key")
      expect(url.searchParams.get("skipHttpRedirect")).toBe("true")
      expect(url.searchParams.get("maxWidthPx")).toBe("1600")
      expect(url.searchParams.get("maxHeightPx")).toBe("1")

      return Response.json({
        photoUri: "https://lh3.googleusercontent.com/places-photo",
      })
    }) as unknown as typeof fetch

    const { GET } = await import("./route")

    const res = await GET(photoRequest("name=places%2Fgoogle-place-123%2Fphotos%2Fphoto-abc&maxWidthPx=9000&maxHeightPx=0"))

    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toBe("https://lh3.googleusercontent.com/places-photo")
    expect(res.headers.get("cache-control")).toBe("no-store")
  })

  test("rejects invalid photo names", async () => {
    const { GET } = await import("./route")

    const res = await GET(photoRequest("name=https%3A%2F%2Fexample.com%2Fphoto.jpg"))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "Google photo name is required" })
  })
})
