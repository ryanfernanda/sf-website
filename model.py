import torch
from kan import KAN
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

# Load the trained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = KAN(width=[5, 30, 1], grid=15, k=3, seed=0, device=device)
model.load_state_dict(torch.load('kans_model.pth', map_location=device))
model.eval()

# Load the scaler
scaler = joblib.load('scaler.pkl')

def predict_sf(pga, b, df, y, p):
    # Prepare input data
    input_data = np.array([[pga, b, df, y, p]])
    
    # Scale the input data
    input_scaled = scaler.transform(input_data)
    
    # Convert to tensor
    input_tensor = torch.tensor(input_scaled, dtype=torch.float32, device=device)
    
    # Make prediction
    with torch.no_grad():
        output = model(input_tensor)
    
    # Return the predicted SF value
    return output.item()