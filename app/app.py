from flask import Flask, request, jsonify
from scanner import scan_cube
from solver import solve_cube

app = Flask(__name__)

@app.post("/solve")
def solve():
    images = request.json["images"]
    cube_string = scan_cube(images)
    solution = solve_cube(cube_string)
    
    return jsonify({
        "cube":cube_string,
        "solution":solution
    })

if __name__ == "__main__":
    app.run(debug=True)