
const testOne = {
    "A": "one",
    "B": ["one","one"],
    "C": {
        "D": "one",
        "E": ["one","one"]
    },
    "F": [
        {
            "G": "one",
            "H": ["one","one"]
        },
        {
            "I": "one",
            "J": ["one","one"]
        }
    ],
    "K": {
        "L": {
            "M": {
                "N": [
                    {
                        "O": "one",
                        "P": "one"
                    },
                    {
                        "Q": "one",
                        "R": {
                            "S":  "one",
                            "T": ["one"]
                        }
                    }
                ]
            },
        }
    }
} 

const testTwo = {
    "A": "two",
    "B": ["two", "two"],
    "C": {
        "D": "two",
        "E": ["two", "two"]
    },
    "F": [
        {
            "G": "two",
            "H": ["two", "two"]
        },
        {
            "I": "two",
            "J": ["two", "two"]
        }
    ],
    "K": {
        "L": {
            "M": {
                "N": [
                    {
                        "O": "two",
                        "P": "two"
                    },
                    {
                        "Q": "two",
                        "R": {
                            "S":  "two",
                            "T": ["two"]
                        }
                    }
                ]
            },
        }
    }
};
const testThree = {};
const t = {
    'count': 0
}
function cloneRecurse(src, tgt, overwrite) {
    for(let key in src) {
        let val = src?.[key];
        if(typeof val === 'object') {
            let newTgt = (Array.isArray(val) ? [] : {});
            if(overwrite) {
                tgt[key] = cloneRecurse(val, newTgt, true);
            }
            else {
                tgt[key] ??= cloneRecurse(val, newTgt, false);
            }
        }
        else {
            if(overwrite) {
                tgt[key] = val;
            }
            else {
                tgt[key] ??= val;
            }
        }
    }
    return tgt;
}

function printRecurse(obj) {
    t.count++;
    if(t.count>100){
        console.log(`max stack size`);
        return;
    }
    for(let key in obj) {
        let val = obj?.[key];
        console.log(`key: ${key} is ${typeof val}`);
        if(typeof val === 'object') {
            printRecurse(Object.create(val));
        }
        else {
            console.log(`key: ${key}, val: ${val} at depth ${t.count} total ${t.total++}`);
        }
    }
    t.count--;
}



t.total = 0;
t.count = 0;
console.log(`${t.total} printRecurse (1a): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testOne);
t.count = 0;
console.log(`cloneRecurse (1 -> 3): -------------------------------------------------------------------------------------------------------------------------------`);
cloneRecurse(testOne, testThree,true);
t.count = 0;
console.log(`printRecurse (1b): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testOne);
t.count = 0;
console.log(`printRecurse (2a): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testTwo);
t.count = 0;
console.log(`printRecurse (3a): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testThree);

t.count = 0;
console.log(`cloneRecurse (2 -> 3): -------------------------------------------------------------------------------------------------------------------------------`);
cloneRecurse(testTwo, testThree,true);
t.count = 0;
console.log(`printRecurse (2b): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testTwo);
t.count = 0;
console.log(`printRecurse (3b): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testThree);
t.count = 0;
console.log(`printRecurse (1c): ------------------------------------------------------------------------------------------------------------------------------------`);
printRecurse(testOne);


