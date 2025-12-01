#!/bin/bash

echo "Testing Teacher Login..."
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "teacher1", "password": "teacher123"}' \
  | python3 -m json.tool

echo -e "\n\nTesting Student Login..."
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "student123"}' \
  | python3 -m json.tool
