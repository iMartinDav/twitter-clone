#!/bin/bash

# Get the token from environment variable or pass it as argument
TOKEN=${1:-$JWT_TOKEN}

if [ -z "$TOKEN" ]; then
    echo "Please provide a JWT token"
    exit 1
fi

# Test the tweet endpoint
curl -X POST http://localhost:8787/tweet \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"content":"Test tweet with proper JWT!"}'
