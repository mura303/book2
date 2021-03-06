rpcgen=require("./rpcgen.js");
Object.assign(global,rpcgen);


var defs= {
    ping: { id:1, dir:BOTH, args:{val:i32} },
    login: { id:2, dir:C2S, args:{name:str8} },
    loginResult: { id:3, dir:S2C, args:{name:str8,result:i32, pc_entity_id:i32} },    
    chat: { id:5, dir:BOTH, args:{text:str8} },
    move: { id:6, dir:C2S, args:{to_x:i32, to_y:i32} },
    field: { id:7, dir:S2C, args:{width:i32, height:i32, ground:i32ary, obj:i32ary } },
    entity: { id:8, dir:S2C, args: {id:i32, type:i32, x:i32, y:i32, state:i32} },
    tryMove: { id:9, dir:C2S, args: { dx:i32, dy:i32} },
    entityDelete: { id:10, dir:S2C, args: {id:i32}},
    log: { id:11, dir:S2C, args: {text:str8}}
};

fs=require("fs");
var js_cl=rpcgen.generateJS(C2S,defs);
fs.writeFileSync("mmoproto_cl.js",js_cl);
var js_sv=rpcgen.generateJS(S2C,defs);
fs.writeFileSync("mmoproto_sv.js",js_sv);


