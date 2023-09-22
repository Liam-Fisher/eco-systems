export function cloneRecurse(src, tgt, overwrite) {
    for (let key in src) {
        let val = src?.[key];
        if (typeof val === 'object') {
            let newTgt = (Array.isArray(val) ? [] : {});
            if (overwrite) {
                tgt[key] = cloneRecurse(val, newTgt, true);
            }
            else {
                tgt[key] ??= cloneRecurse(val, newTgt, false);
            }
        }
        else {
            if (overwrite) {
                tgt[key] = val;
            }
            else {
                tgt[key] ??= val;
            }
        }
    }
    return tgt;
}
