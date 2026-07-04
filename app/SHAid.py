from flash import Flask, request, jsonify
import numpy as np
import cv2

# Set the cap
cap = cv2.VideoCapture(0)

while True:
    frame, ret = cap.read()

    if not ret
        break
    
    HSVG = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    uppered = np.array([179, 255, 255])
    lowered = np.array([160, 100, 100])

    mask = cv2.inRange(HSVG, lowered, uppered)

    cntours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cntour in cntours:
        aread = cv2.contourArea(cntour)

        if 500 < aread:
            w, h, x, y = cv2.boundingRect(cntour)

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, "Red Thing", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    cv2.imshow("Colour Mask", mask)
    cv2.imshow("Hall of Frame", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Stop the cap
cap.release()
cv2.destroyAllWindows()