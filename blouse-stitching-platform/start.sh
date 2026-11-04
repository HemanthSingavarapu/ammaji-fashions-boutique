#!/bin/bash
echo "Starting Backend..."
cd backend
java -jar new-backend.jar &
BACKEND_PID=$!
cd ..

echo "Starting Admin Frontend..."
cd admin-frontend
npm run dev &
ADMIN_PID=$!
cd ..

echo "Starting Customer Frontend..."
cd customer-frontend
npm run dev &
CUSTOMER_PID=$!
cd ..

echo "Services started!"
echo "Backend: http://localhost:8080"
echo "Admin Frontend: http://localhost:5181"
echo "Customer Frontend: http://localhost:5180"
echo "Backend PID: $BACKEND_PID"
echo "Admin PID: $ADMIN_PID"
echo "Customer PID: $CUSTOMER_PID"
echo "Press Ctrl+C to stop all services."

trap "echo 'Stopping all services...'; kill $BACKEND_PID $ADMIN_PID $CUSTOMER_PID; exit" INT

wait
