import cv2
import mediapipe as mp
import time
from fastapi import FastAPI
from finger_count import detect_finger_count
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins=["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize MediaPipe Hands.
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands


@app.get("/detect_fingers")
def detect_fingers():
    count = detect_finger_count()
    return {"finger_count": count}

