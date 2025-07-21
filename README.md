# Kigali Traffic Congestion Prediction API

A FastAPI-based machine learning API for predicting traffic congestion levels in Kigali, Rwanda. This project provides both a REST API and a beautiful web interface for traffic prediction.

## Features

- 🚗 **Traffic Prediction**: Predict congestion levels based on various parameters
- 🌐 **Web Interface**: Beautiful, responsive web UI for easy interaction
- 📊 **API Documentation**: Auto-generated interactive API docs
- 🔍 **Health Monitoring**: Built-in health check endpoints
- 🎯 **Input Validation**: Comprehensive input validation and error handling
- 📱 **Mobile Responsive**: Works perfectly on all devices

## Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package installer)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Access the application**:
   - Web Interface: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### POST /predict
Predict traffic congestion level based on input parameters.

**Request Body:**
```json
{
  "Hour": 8,
  "Day_of_Week": "Monday",
  "Public_Holiday": "No",
  "Road_Name": "KN4",
  "Population_Density": "High",
  "Rainfall": "No Rain"
}
```

**Response:**
```json
{
  "Congestion_Level": "High",
  "confidence_score": 0.85,
  "timestamp": "2024-01-15T10:30:00"
}
```

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

### GET /model-info
Get information about the loaded model and available categories.

### GET /docs
Interactive API documentation (Swagger UI).

## Input Parameters

| Parameter | Type | Description | Valid Values |
|-----------|------|-------------|--------------|
| Hour | int | Hour of the day | 0-23 |
| Day_of_Week | string | Day of the week | Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday |
| Public_Holiday | string | Whether it's a public holiday | Yes, No |
| Road_Name | string | Name of the road | KG 11 Ave, KK 15 Rd, KN 1 Rd, KN 3 Rd, RN1 |
| Population_Density | string | Population density level | Medium, High |
| Rainfall | string | Rainfall condition | No, Yes |

## Congestion Levels

The model predicts one of the following congestion levels:

- **Low**: Minimal traffic congestion
- **Medium**: Moderate traffic congestion
- **High**: Significant traffic congestion
- **Severe**: Extreme traffic congestion

## Usage Examples

### Using cURL
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Hour": 8,
    "Day_of_Week": "Monday",
    "Public_Holiday": "No",
    "Road_Name": "KN 1 Rd",
    "Population_Density": "High",
    "Rainfall": "No"
  }'
```

### Using Python
```python
import requests

url = "http://localhost:8000/predict"
data = {
    "Hour": 8,
    "Day_of_Week": "Monday",
    "Public_Holiday": "No",
    "Road_Name": "KN 1 Rd",
    "Population_Density": "High",
    "Rainfall": "No"
}

response = requests.post(url, json=data)
prediction = response.json()
print(f"Predicted congestion: {prediction['Congestion_Level']}")
```

### Using JavaScript
```javascript
fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        Hour: 8,
        Day_of_Week: "Monday",
        Public_Holiday: "No",
        Road_Name: "KN 1 Rd",
        Population_Density: "High",
        Rainfall: "No"
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Project Structure

```
model/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── README.md            # This file
├── model/               # Model files
│   ├── traffic_model.pkl
│   └── label_encoders.pkl
├── templates/           # HTML templates
│   └── index.html
├── static/             # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
```

## Development

### Running in Development Mode
```bash
python app.py
```

### Running with uvicorn directly
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Variables
You can set the following environment variables:
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input parameters
- **500 Internal Server Error**: Model prediction errors
- **422 Unprocessable Entity**: Validation errors

## Model Information

The prediction model is trained on historical traffic data from Kigali and uses:
- Machine learning algorithm: [Model type will be displayed via /model-info endpoint]
- Feature encoding: Label encoding for categorical variables
- Input validation: Comprehensive validation for all input parameters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Note**: This API is designed for educational and demonstration purposes. For production use, additional security measures, rate limiting, and monitoring should be implemented. 