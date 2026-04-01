#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi
if [ ! -f .env ]; then
  cp .env.example .env
fi
echo "Starting Finance Dashboard Backend..."
npm run dev
