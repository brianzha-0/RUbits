/*  welcome.tsx
        |
        | 100 webcam screenshots
        ↓
    CubeScanner.tsx
        |
        | sends images to Roboflow
        ↓
    Roboflow predictions
        |
        | convert bounding boxes → 3x3 faces
        ↓
    CubeState
        |
        | Essentially, multiple algorithms will sequentially provide (a) solution(s) for the cuber!
        ↓
    cube.tsx editor  */