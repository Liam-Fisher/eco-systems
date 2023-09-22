   
    let buf = Buffer.from([ 
      70, 79, 82, 77, // "FORM"
      0, 0, 0, 0, // filesize 
      74, 73, 84, 33, //"JIT!"
      70, 86, 69, 82, // "FVER"
      0, 0, 0, 12, // 12 
      60, 147, 220, 128,  // "VERSION" 
      77, 84, 82, 88, 
   // chunk_size
      0, 0, 0, 0, 
   // matrixoffset
      0, 0, 0, 0, 
   // type
      70, 76, 54, 52, 
   // planecount 
      0, 0, 0, 0, 
   // dimcount
      0, 0, 0, 0]);
    const typeEnum = ["CHAR","LONG","FL32","FL64"];
    const byteWidthEnum = [1,4,4,8];
    const ulongEnum = [1128808786,1280265799,1179398962,1179399732];

    buf.writeUInt8(60, 0);
    buf.writeUInt8(147, 1);
    buf.writeUInt8(220, 2);
    buf.writeUInt8(128, 3);
    console.log("CODE "+buf.readUInt32BE(0));
      buf.writeUInt32BE(1016323200);
      console.log("CODE "+buf.readUInt32BE(0));
    //buf.writeUInt32BE(1128808786, 0);
    //buf.writeUInt32BE(1280265799, 4);
    //buf.writeUInt32BE(1179398962, 8);
    //buf.writeUInt32BE(1179399732, 12);
    ///console.log("LONG "+buf.readUInt32BE(4));
    ///console.log("FL32 "+buf.readUInt32BE(8));
    ///console.log("FL64 "+buf.readUInt32BE(12));
    
    //console.log("LONG "+buf.subarray(4,8).toString());
    ///console.log("FL32 "+buf.subarray(8,12).toString());
    //console.log("FL64 "+buf.subarray(12,16).toString());

