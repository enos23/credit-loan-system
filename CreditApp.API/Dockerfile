# syntax=docker/dockerfile:1
# Multi-stage build for CreditApp.API.
# Context must be the repo root (`docker build -f CreditApp.API/Dockerfile .`)
# so all four .csproj files are reachable for restore.

# ---------- Stage 1: restore + build + publish ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only .csproj files first so the restore layer caches between rebuilds
# unless dependencies actually change.
COPY CreditApp.API/CreditApp.API.csproj                       CreditApp.API/
COPY CreditApp.Application/CreditApp.Application.csproj       CreditApp.Application/
COPY CreditApp.Domain/CreditApp.Domain.csproj                 CreditApp.Domain/
COPY CreditApp.Infrastructure/CreditApp.Infrastructure.csproj CreditApp.Infrastructure/

RUN dotnet restore CreditApp.API/CreditApp.API.csproj

# Copy the rest of the source.
COPY CreditApp.API/           CreditApp.API/
COPY CreditApp.Application/   CreditApp.Application/
COPY CreditApp.Domain/        CreditApp.Domain/
COPY CreditApp.Infrastructure/ CreditApp.Infrastructure/

# Publish trimmed runtime artifacts.
RUN dotnet publish CreditApp.API/CreditApp.API.csproj \
        --configuration Release \
        --output /app/publish \
        --no-restore

# ---------- Stage 2: runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Run as a non-root user. The aspnet image already provides `app` (uid 1654).
USER app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true

ENTRYPOINT ["dotnet", "CreditApp.API.dll"]
