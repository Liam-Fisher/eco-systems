
export function defaultJxf(matrixType:  "CHAR"|"LONG"|"FL32"|"FL64", bytesize: number, offset: number, planecount: number, ...dims: number[]) {
    let filesize = planecount*bytesize+offset;
    let buf = Buffer.alloc(offset, 0);
    buf.write("FORM");
    buf.writeUInt32BE(filesize, 4); // filesize
    buf.write("JIT!", 8); 
    buf.write("FVER", 12); 
    buf.writeUInt32BE(12, 16); 
    buf.writeUInt32BE(1016323200, 20); // version code?? timestamp??
    buf.write("MTRX", 24); 
    buf.writeUInt32BE(filesize-24,28); // chunksize
    buf.writeUInt32BE(offset-24,32); // bytes before matrix data
    buf.write(matrixType,36); // type code
    buf.writeUInt32BE(planecount,40); // planecount
    buf.writeUInt32BE(dims.length,44); // dimcount 
    dims.forEach((dim, index) => buf.writeUInt32BE(dim, 48+index*4));
    return buf;
};
export function setAttrs()  {
    this.attrs.type ??= "FL64";
    this.typeIndex = ["CHAR","LONG","FL32","FL64"].indexOf(this.attrs.type);
    if(this.typeIndex<0) {
        throw new Error(`invalid matrix type ${this.attrs.type}`);
    };
    this.attrs.dim ??= [ this.maxLetters, this.wordLengths.length];
    this.attrs.planecount ??= Math.max(...this.parameterSizes);
    this.attrs.dimcount = this.attrs.dim.length;
    this.bytesize = [1,4,4,8][this.typeIndex];
    this.offset =  this.attrs.dimcount*4+48;
    this.filesize = this.offset+this.attrs.planecount*this.bytesize*this.attrs.dim.reduce((a, v) => a + v, 0);
    for(let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    
}