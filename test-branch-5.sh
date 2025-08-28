#!/bin/bash
# Test script for Branch 5 Enhanced RAG

echo "=== Testing Branch 5: fetch-emails Enhanced RAG ==="
echo ""

echo "1. Testing search options endpoint:"
curl -s http://localhost:3000/rag/search-options | jq '.searchOptions.examples' 2>/dev/null || echo "JSON parsing not available, raw response:"

echo ""
echo "2. Testing enhanced RAG query (grocery spending):"
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "cuanto gaste en comestibles"}' 2>/dev/null || echo "Request failed"

echo ""
echo "3. Testing direct email search:"
curl -X POST http://localhost:3000/rag/search-emails \
  -H "Content-Type: application/json" \
  -d '{"categories": ["comestibles"]}' 2>/dev/null || echo "Request failed"

echo ""
echo "=== Tests completed ==="
