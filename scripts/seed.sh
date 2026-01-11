#!/bin/bash

# Database seed runner script
# Runs the TypeScript seed file with proper error handling

set -e

echo "🌱 Starting database seed..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable not set"
  echo "Please configure .env.local with your database URL"
  exit 1
fi

# Run the seed
echo "📝 Running seed.ts..."
tsx prisma/seed.ts

if [ $? -eq 0 ]; then
  echo "✅ Database seeded successfully!"
else
  echo "❌ Seed failed"
  exit 1
fi
