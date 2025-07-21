#!/usr/bin/env python3
"""
Test script for the Kigali Traffic Congestion Prediction API
"""

import requests
import json
import time
from typing import Dict, Any

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_model_info():
    """Test the model info endpoint"""
    print("\n📊 Testing model info...")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model info retrieved:")
            print(f"   Model type: {data.get('model_type', 'Unknown')}")
            print(f"   Available categories: {len(data.get('available_categories', {}))}")
            return True
        else:
            print(f"❌ Model info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model info error: {e}")
        return False

def test_prediction(input_data: Dict[str, Any]):
    """Test the prediction endpoint"""
    print(f"\n🚗 Testing prediction with data: {input_data}")
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=input_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction successful:")
            print(f"   Congestion Level: {data['Congestion_Level']}")
            print(f"   Confidence Score: {data['confidence_score']:.2f}")
            print(f"   Timestamp: {data['timestamp']}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def test_invalid_input():
    """Test with invalid input data"""
    print("\n⚠️  Testing invalid input...")
    invalid_data = {
        "Hour": 25,  # Invalid hour
        "Day_of_Week": "InvalidDay",
        "Public_Holiday": "No",
        "Road_Name": "InvalidRoad",
        "Population_Density": "High",
        "Rainfall": "No Rain"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            print("✅ Invalid input correctly rejected")
            return True
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid input test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting API tests...")
    print("=" * 50)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health_check),
        ("Model Info", test_model_info),
        ("Valid Prediction", lambda: test_prediction({
            "Hour": 8,
            "Day_of_Week": "Monday",
            "Public_Holiday": "No",
            "Road_Name": "KN 1 Rd",
            "Population_Density": "High",
            "Rainfall": "No"
        })),
        ("Invalid Input", test_invalid_input),
        ("Weekend Prediction", lambda: test_prediction({
            "Hour": 14,
            "Day_of_Week": "Saturday",
            "Public_Holiday": "No",
            "Road_Name": "KK 15 Rd",
            "Population_Density": "Medium",
            "Rainfall": "Yes"
        })),
        ("Holiday Prediction", lambda: test_prediction({
            "Hour": 10,
            "Day_of_Week": "Friday",
            "Public_Holiday": "Yes",
            "Road_Name": "RN1",
            "Population_Density": "Medium",
            "Rainfall": "Yes"
        }))
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the API implementation.")
    
    print("\n🌐 You can now access:")
    print(f"   Web Interface: {BASE_URL}")
    print(f"   API Documentation: {BASE_URL}/docs")
    print(f"   Health Check: {BASE_URL}/health")

if __name__ == "__main__":
    main() 