import cv2
import mediapipe as mp

# Initialize MediaPipe Hands.
mp_hands = mp.solutions.hands

def detect_finger_count():
    cap = cv2.VideoCapture(0)
    finger_count = 0  # Variable to store the final finger count.

    with mp_hands.Hands(
        model_complexity=0,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as hands:
      
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                continue

            # Mark the image as not writeable to improve performance.
            image.flags.writeable = False
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image)

            # Initialize finger count to 0.
            finger_count = 0

            if results.multi_hand_landmarks:
                # Only process the first hand detected.
                hand_landmarks = results.multi_hand_landmarks[0]
                hand_label = results.multi_handedness[0].classification[0].label

                hand_landmarks_list = []
                for landmarks in hand_landmarks.landmark:
                    hand_landmarks_list.append([landmarks.x, landmarks.y])

                # Thumb
                if hand_label == "Left" and hand_landmarks_list[4][0] > hand_landmarks_list[3][0]:
                    finger_count += 1
                elif hand_label == "Right" and hand_landmarks_list[4][0] < hand_landmarks_list[3][0]:
                    finger_count += 1

                # Other fingers
                if hand_landmarks_list[8][1] < hand_landmarks_list[6][1]:  # Index finger
                    finger_count += 1
                if hand_landmarks_list[12][1] < hand_landmarks_list[10][1]:  # Middle finger
                    finger_count += 1
                if hand_landmarks_list[16][1] < hand_landmarks_list[14][1]:  # Ring finger
                    finger_count += 1
                if hand_landmarks_list[20][1] < hand_landmarks_list[18][1]:  # Pinky
                    finger_count += 1

            # If no fingers are detected as raised, set fingerCount to 6.
            if finger_count == 0:
                finger_count = 6

            # Exit loop after detecting the finger count.
            break

    cap.release()
    return finger_count

# Example usage:
print("Detected Finger Count:", detect_finger_count())
