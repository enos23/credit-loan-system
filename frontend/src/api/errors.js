// Pulls a human-readable error message out of an axios error, handling all
// response shapes used by this API:
//   - ProblemDetails JSON  → { status, title, type, ... }
//   - Plain text body      → "Prea multe încercări..."  (rate limiter, legacy strings)
//   - Validation 400       → { errors: { Field: ["..."] }, title: "One or more..." }
export function extractErrorMessage(err, fallback) {
    const data = err?.response?.data;
    if (data == null) return fallback;
    if (typeof data === 'string') return data;
    if (typeof data !== 'object') return fallback;

    // [ApiController] validation: prefer the first field error over the generic title.
    if (data.errors && typeof data.errors === 'object') {
        const firstField = Object.values(data.errors)[0];
        if (Array.isArray(firstField) && firstField.length > 0) return firstField[0];
    }

    return data.detail || data.title || data.message || fallback;
}
