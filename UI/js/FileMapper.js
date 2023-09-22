autowatch = 1;

inlets = 1;
outlets = 3;
var validMaxClasses = ["qlist", "text", "coll", "seq", "seq~", "funbuff", "jit.gl.model", "jit.gl.texture", "dict", "jit.matrix", "filein", "buffer~"];
var aliases = {
    "dsp_seq": "seq~",
    "jit_gl_model": "jit.gl.model", 
    "jit_matrix": "jit.matrix",
    "dsp_buffer": "buffer~"
};
var maps = {};
var inlabels = {};
var outlabels = {};
var fileobjects = {};
var tabs = [];
var filepaths = {};
var attrs = {};
var singleConnection = new Dict("singleConnection");
singleConnection.set("in", 0);
singleConnection.set("out", 0);

function addFilepaths(path) {
    filepaths = {};
    inlabels = {};
    var experimentFolder = new Folder(path);
    experimentFolder.next();
    while (!experimentFolder.end) {
        var format = experimentFolder.filename;
        post("\nfiles for format: " + format);
        if ((format !== 'attributes')&&(format !== 'media')&&(format !== 'systems')&&(format !== 'logs')&&(format !== 'filemaps')) {
            if(format in aliases) {
                format = aliases[format];
            };
            filepaths[format] = [];
            inlabels[format] = [];
            var formatFolder = new Folder(path + "/" + format);
            formatFolder.next();
            while (!formatFolder.end) {
                var file = formatFolder.filename;
                filepaths[format].push(path + "/" + format + "/" + file);
                inlabels[format].push(file.slice(0, file.lastIndexOf('.')));
                formatFolder.next();
            }
            formatFolder.close();
        }
        experimentFolder.next();
    }
    experimentFolder.close();
}
function getVarnames(targetFilepath) {
    fileobjects = {};
    outlabels = {};
    for (i = 0; i < validMaxClasses.length; i++) {
        var format = validMaxClasses[i];
        if(format in aliases) {
            format = aliases[format];
        };
        fileobjects[format] = [];
        outlabels[format] = [];
    };
    var activeWindow = max.frontpatcher.wind;
    while (activeWindow) {
        var activePatcher = activeWindow.assoc;
        var activePath = activePatcher.filepath;
        if (activePath == targetFilepath) {
            var activeObject = activePatcher.firstobject;
            while (activeObject) {
                var vn = activeObject.varname;
                var format = activeObject.maxclass;
                if (format in fileobjects) {
                    if (vn) {
                        fileobjects[format].push(vn);
                        outlabels[format].push(vn);
                    }
                    else {
                        post("\n found unnamed object of class " + format)
                    }
                }
                activeObject = activeObject.nextobject;
            }
            break;
        }
        activeWindow = activeWindow.next;
    }
    tabs = [];
    for (var format in fileobjects) {
        if ((format in filepaths) && (fileobjects[format].length)) {
            maps[format] = new Dict(format + "Connections");
            maps[format].clear();
            maps[format].set("numins", filepaths[format].length);
            maps[format].set("numouts", fileobjects[format].length);
            // auto-connect if there is exactly one file and one object for a given format  
            if ((filepaths[format].length == 1) && (fileobjects[format].length == 1)) {
                maps[format].set("connections", singleConnection);
            };
            tabs.push(format);
        }
    };
    outlet(1, "tabs", tabs);
    outlet(1, 0);
};
function getConnections(format) {
    if ((format in filepaths) && (fileobjects[format].length)) {
        outlet(0, "dictionary", maps[format].name);
        outlet(0, "inlabels", inlabels[format]);
        outlet(0, "outlabels", outlabels[format]);
    }
}
function sendReadMessages() {
    outlet(2, 0, "zlclear");
    for (var format in maps) {
        var connections = maps[format].getsize("connections");
        if (connections) {
            for (i = 0; i < connections; i++) {
                var connectionsDict = maps[format].get(("connections[" + i + "]"));
                var filepath = filepaths[format][connectionsDict.get("in")];
                var fileobject = fileobjects[format][connectionsDict.get("out")];
                var msg = format === "jit.gl.material" ? "import_material" : "read";
                outlet(2, fileobject, msg, filepath);
            }
        }
    }
    outlet(2, 1, 1);
}