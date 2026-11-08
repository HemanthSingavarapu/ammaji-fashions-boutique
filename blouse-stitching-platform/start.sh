#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "Starting Python FastAPI Backend..."
cd project_backned
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!
cd "$DIR"

echo "Starting Admin Frontend..."
cd admin-frontend
npm run dev &
ADMIN_PID=$!
cd "$DIR"

echo "Starting Customer Frontend..."
cd customer-frontend
npm run dev &
CUSTOMER_PID=$!
cd "$DIR"

echo ""
echo "========================================================"
echo " Services started successfully!"
echo " Customer Frontend: http://localhost:5180"
echo " Admin Frontend:    http://localhost:5181"
echo " Python API:        http://localhost:8080"
echo " Swagger API Docs:  http://localhost:8080/docs"
echo "========================================================"
echo "Backend PID:  $BACKEND_PID"
echo "Admin PID:    $ADMIN_PID"
echo "Customer PID: $CUSTOMER_PID"
echo "Press Ctrl+C to stop all services."
echo ""

trap "echo 'Stopping all services...'; kill $BACKEND_PID $ADMIN_PID $CUSTOMER_PID; exit" INT

wait
