"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let testSchema = {
    "regex": new RegExp('(F)', 'g'),
    "rules": [
        {
            "maps": ["zero"],
            "successors": ['GFH']
        }
    ],
    "hooks": {
        "pre_production": [],
        "pre_mapping": [],
        "post_production": [],
        "post_mapping": []
    },
    "interpretations": {}
};
// state properties
