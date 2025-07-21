#!/bin/bash

# Kigali Traffic Congestion Prediction API Startup Script

echo "🚀 Starting Kigali Traffic Congestion Prediction API..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip and try again."
    exit 1
fi

# Check if model files exist
if [ ! -f "model/traffic_model.pkl" ] || [ ! -f "model/label_encoders.pkl" ]; then
    echo "❌ Model files not found. Please ensure traffic_model.pkl and label_encoders.pkl are in the model/ directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your Python environment."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Start the application
echo "🌐 Starting the API server..."
echo "📍 The application will be available at:"
echo "   - Web Interface: http://localhost:8000"
echo "   - API Documentation: http://localhost:8000/docs"
echo "   - Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py 