from flask import Flask, jsonify, request
from flask_cors import CORS
import data_service as ds

app = Flask(__name__)
CORS(app)


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/prices')
def prices():
    """
    GET /api/prices
    Query params:
      start  - ISO date string (e.g. 1990-01-01)
      end    - ISO date string
      resample - W | M | Q | Y  (optional downsampling)
    """
    start = request.args.get('start')
    end = request.args.get('end')
    resample = request.args.get('resample')
    return jsonify(ds.get_prices(start=start, end=end, resample=resample))


@app.route('/api/events')
def events():
    """GET /api/events — returns all key events"""
    return jsonify(ds.get_events())


@app.route('/api/change-points')
def change_points():
    """GET /api/change-points — returns detected structural breaks"""
    return jsonify(ds.get_change_points())


@app.route('/api/event-impact')
def event_impact():
    """
    GET /api/event-impact
    Query params:
      window - number of days before/after event (default 30)
    """
    window = int(request.args.get('window', 30))
    return jsonify(ds.get_event_impact(window_days=window))


@app.route('/api/volatility')
def volatility():
    """
    GET /api/volatility
    Query params:
      window - rolling window in days (default 30)
      start, end - date filters
    """
    window = int(request.args.get('window', 30))
    start = request.args.get('start')
    end = request.args.get('end')
    return jsonify(ds.get_volatility(window=window, start=start, end=end))


@app.route('/api/summary')
def summary():
    """GET /api/summary — dataset-level statistics"""
    return jsonify(ds.get_summary_stats())


if __name__ == '__main__':
    app.run(debug=True, port=5000)
