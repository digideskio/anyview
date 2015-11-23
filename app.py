from flask import Flask, render_template, request
from flask.ext.restful import Api, Resource
from flask_restful import reqparse
from socwatch import SOCWatchDataSet, SOCWatchParse
from noc import NOCDataSet, NOCParse

app = Flask(__name__)
api = Api(app)

@app.route('/')
def index():
    return render_template('index.html')

api.add_resource(SOCWatchDataSet, '/api/socwatch/dataset', endpoint = 'socwatch_dataset')
api.add_resource(SOCWatchParse, '/api/socwatch/parse', endpoint = 'socwatch_parse')
api.add_resource(NOCDataSet, '/api/noc/dataset', endpoint = 'noc_dataset')
api.add_resource(NOCParse, '/api/noc/parse', endpoint = 'noc_parse')


if __name__ == '__main__':
    #app.run(host='10.239.153.10', port=8080, debug=True)
    app.run(debug=True)
