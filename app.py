from flask import Flask, render_template, request, jsonify
from model import predict_sf

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Get input values from the form
        pga = float(request.form['pga'])
        b = float(request.form['b'])
        df = float(request.form['df'])
        y = float(request.form['y'])
        p = float(request.form['p'])

        # Make prediction
        sf = predict_sf(pga, b, df, y, p)

        return jsonify({'sf': f"{sf:.2f}"})

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)