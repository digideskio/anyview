from flask import jsonify
from flask.ext.restful import Resource
from flask_restful import reqparse
import os, re, numpy as np

data_dir = 'data/noc/'
re_consumer = re.compile(r'Probe.*[(](.*)[)]')

def get_consumer(line):
    r = re_consumer.search(line);
    if r is not None:
        return r.group(1)
    else:
        return None

def get_value(line, item):
    r = re.search(item+'=([0-9]*)', line)
    if r is not None:
        return r.group(1)
    else:
        return '0'

def read_file(name):
    f = open(data_dir + name, 'r')
    result = f.readlines()
    f.close()
    return result

def get_all(lines):
    # initialize the result
    consumers = ['GPU', 'CPU0', 'CPU1', 'EMIC0', 'EMIC1', 'EMIC2', 'DMA8C_1', 'DMA4C']
    value_names = ['max', 'min', 'mean', 'current']#, 'NbOfMeasure']
    result = {}
    for c in consumers:
        result[c] = {}
        for v in value_names:
            result[c].update({v:[]})

    # parse
    i = 0
    while i < len(lines):
        c = get_consumer(lines[i])
        if c is not None:
            for name in value_names:
                result[c][name].append(int(get_value(lines[i+1], name)))
            i = i + 2
        else:
            i = i + 1

    return result

class NOCDataSet(Resource):
    def get(self):
        return sorted(os.listdir(data_dir))

class NOCParse(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('file', required=True)
        args = parser.parse_args()
        r = get_all(read_file(args['file']))
        return r
