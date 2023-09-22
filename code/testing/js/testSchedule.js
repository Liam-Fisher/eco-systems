
const testSchedule = new Map();

function scheduler(generations, s)  {
    for(let k in s){
        console.log(`key: ${k}`)
    };
    let sKeys = Object.keys(s);
    
    let sValues = Object.values(s);
    let reStr = '('+(sKeys.map(k1 => `${k1.split('|').map(k2=>`(?:^${k2}$)`).join('|')}`).join(')|('))+')';
    console.log('reStr '+reStr );
    let re = new RegExp(reStr, 'g');
    console.log(re.source);
    for(let i=1;i<=generations;i++) {
        String(i).replaceAll(re, (...args) => {
            console.log(`index:  ${i} match: ${args[0]}`);
            Object.entries(sValues[args.slice(1,-2).findIndex(el => el)]).forEach( (e) => {
                let newEntry = 
                testSchedule.set(i, )
                console.log(`componentID: ${e[0]}`);
                console.log(`systemIDs: ${e[1].join(' ')}`);
            });
        

           // console.log('entry: '+index);
            //if((!src)||offset) return;
        });
    };

}

let testScheduleBlueprint = {
    "[1-3]": {
        "A": ["X0","Y0"],
        "B": ["X1","Y0"]
    },
    "[7-9]|[1-2][0-9]|3[0-2]": {
        "D": ["X3"]
    },
    "5": {
        "C": ["X2"]
    }
};
scheduler(48, testScheduleBlueprint);