#!/usr/bin/env bash
# Generates .env from the secrets you already have in `dotnet user-secrets`
# for the CreditApp.API project. Run from the repo root.
#
# Usage: ./bin/generate-dotenv.sh
#
# Idempotent: overwrites .env each time. The .env is gitignored, so it stays
# on your machine only.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/CreditApp.API"
OUT_FILE="$ROOT_DIR/.env"

cd "$API_DIR"

# Read user-secrets into an associative array.
declare -A SECRETS
while IFS= read -r line; do
    key="${line%% = *}"
    val="${line#* = }"
    SECRETS["$key"]="$val"
done < <(dotnet user-secrets list 2>/dev/null)

get_or_fail() {
    local key="$1"
    if [[ -z "${SECRETS[$key]:-}" ]]; then
        echo "✗ Missing user-secret: $key" >&2
        echo "  Run: dotnet user-secrets set \"$key\" \"<value>\" (in CreditApp.API/)" >&2
        exit 1
    fi
    echo "${SECRETS[$key]}"
}

JWT="$(get_or_fail JwtSettings:SecretKey)"
DB="$(get_or_fail ConnectionStrings:DefaultConnection)"
ANTHROPIC="$(get_or_fail Anthropic:ApiKey)"
ADMIN_EMAIL="${SECRETS[Seed:AdminEmail]:-admin@creditapp.com}"
ADMIN_PW="$(get_or_fail Seed:AdminPassword)"

cat > "$OUT_FILE" <<EOF
# Auto-generated from dotnet user-secrets. Run bin/generate-dotenv.sh to refresh.

JWT_SECRET_KEY=$JWT
DB_CONNECTION_STRING=$DB
ANTHROPIC_API_KEY=$ANTHROPIC
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PW

FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5286/api
EOF

chmod 600 "$OUT_FILE"
echo "✓ Wrote $OUT_FILE (mode 600)"
