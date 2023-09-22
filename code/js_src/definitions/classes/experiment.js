let f = {
    "settings": {},
    "options": {},
    "interpreters": {
        "interpreterA": {
            "attrs": {
                "precision": 5
            },
            "fileGroupSizes": 1,
            "method": "SimpleTurtle",
            "mode": "streaming",
            "sequenceSchema": {
                "0": ["moveForward"],
                "systemA_1": ["turnLeft"],
                "systemA_2": ["turnRight"]
            },
            "format": "coll"
        }
    },
    "systems": {
        "systemA": {
            "axiom": 0,
            "props": {
                "stepSize": 0.02,
                "turnIncrement": 0.25,
                "x_position": 0,
                "y_position": 0,
                "direction": 0.3
            }
        }
    },
    "syntax": {
        "words": [[0, 2, 0, 2, 0, 2, 0], [0, 2, 0, 1, 0, 1, 0, 0, 2, 0, 2, 0, 1, 0]],
        "axioms": [[0, [0], [0], [0], [0], [0], [0], [0]]],
        "contexts": [],
        "letters": [70, 71, 72]
    },
    "timetable": {
        "generations": 3,
        "schemata": [
            {
                "times": [0, 1, 2, 3],
                "methods": {
                    "schemaA": ["systemA"]
                }
            }
        ],
        "interactions": [],
        "interpretations": [
            {
                "times": [1],
                "methods": {
                    "interpreterA": ["systemA"]
                }
            }
        ]
    },
    "schemata": {
        "schemaA": {
            "rules": [{
                    "strictPredecessor": 0,
                    "successors": [["zero", 1]]
                }],
            "hooks": {
                "pre_production": ["noise"]
            }
        }
    }
};
export {};
