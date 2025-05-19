from flask import Flask, request, send_from_directory, abort
import os

app = Flask(__name__)

# The folder contain music files
MUSIC_FOLDER = os.path.dirname(os.path.abspath(__file__))

@app.route("/playmusic")
def play_music():
    name = request.args.get("name")

    if not name:
        return "Thiếu tham số 'name'", 400

    filename = f"{name}.mp3"
    filepath = os.path.join(MUSIC_FOLDER, filename)

    # Check if the file exists and is an mp3 file
    if not os.path.isfile(filepath) or not filename.endswith('.mp3'):
        abort(404, description="Không tìm thấy file")

    return send_from_directory(MUSIC_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True, port=6666)