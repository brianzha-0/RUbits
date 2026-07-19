import base64
import cv2
import numpy as np
from color_detection import detect_face

def decode_image(data):
    encoded = data.split(",")[1]
    binary = base64.b64decode(encoded)
    array = np.frombuffer(binary,np.uint8)

    return cv2.imdecode(array,cv2.IMREAD_COLOR)

def scan_cube(images):
    faces = {}

    for image in images:
        img = decode_image(image)
        face = detect_face(img)

        if face is None:
            continue

        face_name = face["name"]
        faces[face_name] = face["stickers"]

    return build_cube_string(faces)

def build_cube_string(faces):
    order, cube = ["U","R","F","D","L","B"], ""

    for f in order:
        cube += "".join(faces[f])

    return cube