#!/bin/bash
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$HOME/.dotnet:$PATH

echo "Starting backend..."
dotnet run --project CreditApp.API &

echo "Starting frontend..."
cd frontend && npm run dev
