#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Resume Skill Extractor — ONE-COMMAND STARTUP SCRIPT
# ─────────────────────────────────────────────────────────
echo ""
echo "🧠 Resume Skill Extractor — Setup"
echo "─────────────────────────────────"

# Check for .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  No .env file found. Created one from .env.example"
  echo "    Please open .env and set your GROQ_API_KEY, then re-run this script."
  echo ""
  echo "    Get your free key at: https://console.groq.com"
  echo ""
  exit 1
fi

# Check GROQ_API_KEY is set
if grep -q "your_groq_api_key_here" .env; then
  echo ""
  echo "⚠️  You haven't set your GROQ_API_KEY in .env yet!"
  echo "    Open .env and replace: your_groq_api_key_here"
  echo "    with your real key from: https://console.groq.com"
  echo ""
  exit 1
fi

echo "✅ .env file found"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed."
  echo "   Download from: https://www.docker.com/products/docker-desktop"
  exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo ""
echo "🚀 Starting containers (this may take 2-3 min on first run)..."
echo ""

docker compose up --build

