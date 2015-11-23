from flask import jsonify
from flask.ext.restful import Resource
from flask_restful import reqparse
import os, numpy as np

num_of_cores = 4
data_dir = 'data/socwatch/'

def get_lines_from_file(name):
    f = open(data_dir + name, 'r')
    result = f.readlines()
    f.close()
    return result

def listify(s):
    return filter(lambda x: x is not '', map(lambda x: x.strip('" \n\t'), s.split(',')))

def get_core_c_state(lines):
    for i in range(0, len(lines)):
        if 'SOFIA C-state residencies' in lines[i]:
            states = listify(lines[i+2])
            percent = []
            for j in range(0, num_of_cores):
                percent.append(map(float, listify(lines[i+3+j])[1:]))
            print states
            return {'states' : states, 'residencies' : percent}

def get_core_p_state(lines):
    for i in range(0, len(lines)):
        if 'SOFIA P-state residencies' in lines[i]:
            states = listify(lines[i+3])
            percent = []
            for j in range(0, num_of_cores):
                percent.append(map(float, listify(lines[i+4+3*j])))
            return {'states' : states, 'residencies' : percent}

def get_module_c_state(lines):
    for i in range(0, len(lines)):
        if 'SOFIA Module C-state residencies' in lines[i]:
            states = listify(lines[i+2])
            percent = map(float, listify(lines[i+3]))
            return {'states' : states, 'residencies' : percent}

def get_top10_irqs(lines):
    for i in range(0, len(lines)):
        if 'Top 10 IRQs Causing VMM Wake-ups' in lines[i]:
            titles = listify(lines[i+2])
            data = []
            for j in range(0, 10):
                data.append(map(lambda x: int(x) if x.isdigit() else x, listify(lines[i+3+j])))
            return {'detail' : titles, 'data' : data}

def round2(arr):
    return np.around(arr, decimals=2)

def norm2d(arr):
    return np.around(np.diag(100.0/arr.sum(axis=1)).dot(arr), decimals=2)

def norm1d(arr):
    return np.around(100.0*arr/arr.sum(), decimals=2)

def get_all(content):
    result = {}
    result['cstate'] = get_core_c_state(content)
    result['pstate'] = get_core_p_state(content)
    result['module_cstate'] = get_module_c_state(content)
    result['irqs'] = get_top10_irqs(content)

    x = np.array(result['pstate']['residencies'])
    y = np.array(map(lambda s: int(s.strip(' Mhz')), result['pstate']['states']))
    # all core's p-state frequency-residency distribution
    #result['pstate']['values_norm'] = norm2d(x).tolist()
    # all core's p-state pnp distribution (freq*residency)
    result['pstate']['power'] = round2(x.dot(np.diag(y))).tolist()
    # Cores' C0 state residencies comparison
    i = np.array(result['cstate']['residencies']).T[0]
    result['cstate']['c0_dist'] = round2(i).tolist()
    # Each core's total C0 power
    result['cstate']['power'] = round2(x.dot(y)*0.01).tolist()
    # Total C0 power
    #result['cstate']['total_power'] = x.dot(y)*0.01
    # convert irq count to integer and calculate normalized percentage for each irq count
    j = np.array(result['irqs']['data']).T[0].astype(int)
    result['irqs']['count'] = j.tolist()
    #result['irqs']['count_norm'] = norm1d(j).tolist()
    result['irqs']['names'] = np.array(result['irqs']['data']).T[-1].tolist();

    return result

class SOCWatchDataSet(Resource):
    def get(self):
        return sorted(os.listdir(data_dir))

class SOCWatchParse(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('file', required=True)
        args = parser.parse_args()
        r = get_all(get_lines_from_file(args['file']))
        r['core_list'] = map(lambda x: 'Core '+str(x), range(0, len(r['cstate']['c0_dist'])))
        return r
