from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import os
from typing import List, Dict, Any
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Kigali Traffic Congestion Prediction API",
    description="A machine learning API for predicting traffic congestion levels in Kigali, Rwanda",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Load the model and encoders
try:
    model = joblib.load('model/traffic_model.pkl')
    le_dict = joblib.load('model/label_encoders.pkl')
    logger.info("Model and encoders loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

# Define input data model using Pydantic with validation
class TrafficInput(BaseModel):
    Hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    Day_of_Week: str = Field(..., description="Day of the week")
    Public_Holiday: str = Field(..., description="Whether it's a public holiday")
    Road_Name: str = Field(..., description="Name of the road")
    Population_Density: str = Field(..., description="Population density level")
    Rainfall: str = Field(..., description="Rainfall condition")

    class Config:
        json_schema_extra = {
            "example": {
                "Hour": 8,
                "Day_of_Week": "Monday",
                "Public_Holiday": "No",
                "Road_Name": "KN 1 Rd",
                "Population_Density": "High",
                "Rainfall": "No"
            }
        }

class PredictionResponse(BaseModel):
    Congestion_Level: str
    confidence_score: float
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: str

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the main HTML page"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        timestamp=datetime.now().isoformat()
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_traffic(input_data: TrafficInput):
    """
    Predict traffic congestion level based on input parameters.
    
    Args:
        input_data: TrafficInput object containing prediction features
        
    Returns:
        PredictionResponse with congestion level and confidence score
    """
    try:
        # Convert input to dictionary
        input_dict = input_data.dict()

        # Define categorical columns
        categorical_cols = ['Day_of_Week', 'Public_Holiday', 'Road_Name', 'Population_Density', 'Rainfall']
        
        # Create DataFrame with correct column order
        # Let's first check what columns the model expects
        try:
            # Get the expected feature names from the model
            expected_features = model.feature_names_in_
            
            # Create user input DataFrame in the correct order
            user_input = pd.DataFrame({
                'Day_of_Week': [input_dict['Day_of_Week']],
                'Public_Holiday': [input_dict['Public_Holiday']],
                'Road_Name': [input_dict['Road_Name']],
                'Population_Density': [input_dict['Population_Density']],
                'Rainfall': [input_dict['Rainfall']],
                'Hour': [input_dict['Hour']]
            })
            
        except AttributeError:
            # If model doesn't have feature_names_in_, use default order
            user_input = pd.DataFrame({
                'Hour': [input_dict['Hour']],
                'Day_of_Week': [input_dict['Day_of_Week']],
                'Public_Holiday': [input_dict['Public_Holiday']],
                'Road_Name': [input_dict['Road_Name']],
                'Population_Density': [input_dict['Population_Density']],
                'Rainfall': [input_dict['Rainfall']]
            })

        # Encode categorical variables
        categorical_cols = ['Day_of_Week', 'Public_Holiday', 'Road_Name', 'Population_Density', 'Rainfall']
        for col in categorical_cols:
            user_input[col] = user_input[col].astype(str)
            if not all(user_input[col].isin(le_dict[col].classes_)):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid value in {col}. Must be one of {list(le_dict[col].classes_)}"
                )
            user_input[col] = le_dict[col].transform(user_input[col])

        # Predict
        prediction = model.predict(user_input)
        predicted_congestion = le_dict['Congestion_Level'].inverse_transform(prediction)[0]
        
        # Get prediction probabilities if available
        try:
            probabilities = model.predict_proba(user_input)
            confidence_score = float(max(probabilities[0]))
        except:
            confidence_score = 0.8  # Default confidence if predict_proba not available

        logger.info(f"Prediction made: {predicted_congestion} with confidence {confidence_score}")

        return PredictionResponse(
            Congestion_Level=predicted_congestion,
            confidence_score=confidence_score,
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model and available categories"""
    try:
        model_info = {
            "model_type": type(model).__name__,
            "available_categories": {},
            "expected_features": None
        }
        
        # Get expected feature names if available
        if hasattr(model, 'feature_names_in_'):
            model_info["expected_features"] = list(model.feature_names_in_)
        
        for col, le in le_dict.items():
            if hasattr(le, 'classes_'):
                model_info["available_categories"][col] = list(le.classes_)
        
        return model_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

@app.get("/api-docs")
async def api_documentation():
    """Redirect to API documentation"""
    return {"message": "API documentation available at /docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 