
var wsaddr = document.location.host.split(":")[0];
var g_ws=new WebSocket( "ws://"+wsaddr+":22222", ["game-protocol"]);
g_ws.binaryType = "arraybuffer";

g_ws.sendJSON = function(o) {
    this.send(JSON.stringify(o));
}
g_ws.onopen = function() {
    console.log("ws opened");
};
g_ws.onclose = function() {
    console.log("ws closed");
};
g_ws.onerror = function(error) {
    console.log("ws Error",error);
};

var g_debug_latency=0;
g_ws.onmessage = function (ev) {
    if(g_debug_latency>0) {
        setTimeout( function() {
            recv_binary_message(g_ws,ev.data);        
        },g_debug_latency);
    } else {
        recv_binary_message(g_ws,ev.data);                
    }
};

recv_ping = function(conn,val) {
    console.log("recv_ping:",val);
    appendLog("ping ok, connected to server.");
}
recv_loginResult = function(conn,name,result,pc_entity_id) {
    console.log("recv_loginResult:",name,result,pc_entity_id);
    g_pc_entity_id=pc_entity_id;
    appendLog(`login name: ${name} result: ${result}`);
    document.getElementById("inputname").innerHTML="";
}
recv_field = function(conn,width,height,ground,obj) {
    console.log("recv_field:",width,height,ground,obj);
    g_fld=new Field(width,height);
    g_fld.obj=obj;
    g_fld.ground=ground;
    setupFieldGrid();
}
recv_entity = function(conn,id,type,x,y,state) {
    console.log("recv_entity:",id,type,x,y,state);
    var e=findEntity(id);
    if(!e) {
        console.log("new entity");
        e=createEntity(id,type,x,y);
    } else {
        e.setFldLoc(x,y);
    }
    if(state==ENTITY_STATE_STANDING) {
        e.setUVRot(false);
    } else {
        e.setUVRot(true);
    }
}
recv_entityDelete = function(conn,id) {
    console.log("recv_entityDelete:",id);
    var e=findEntity(id);
    e.to_clean=true;
}
recv_log = function(conn,msg) {
    appendLog(msg);
}



////////////////////

var anim_cnt=0;
var last_anim_at = new Date().getTime();

function animate() {
    anim_cnt++;
	requestAnimationFrame( animate );

    if(g_keyboard.getToggled("ArrowRight")) {
        g_keyboard.clearToggled("ArrowRight");
        send_tryMove(g_ws,1,0);
    }
    if(g_keyboard.getToggled("ArrowLeft")) {
        g_keyboard.clearToggled("ArrowLeft");
        send_tryMove(g_ws,-1,0);
    }
    if(g_keyboard.getToggled("ArrowUp")) {
        g_keyboard.clearToggled("ArrowUp");
        send_tryMove(g_ws,0,1);
    }
    if(g_keyboard.getToggled("ArrowDown")) {
        g_keyboard.clearToggled("ArrowDown");
        send_tryMove(g_ws,0,-1);
    }
    if(g_keyboard.getToggled("a")) {
        g_keyboard.clearToggled("a");
        send_tryMove(g_ws,-1,0);
    }
    if(g_keyboard.getToggled("s")) {
        g_keyboard.clearToggled("s");
        send_tryMove(g_ws,0,-1);
    }
    if(g_keyboard.getToggled("d")) {
        g_keyboard.clearToggled("d");
        send_tryMove(g_ws,1,0);
    }
    if(g_keyboard.getToggled("w")) {
        g_keyboard.clearToggled("w");
        send_tryMove(g_ws,0,1);
    }    
    if(g_mouse.getButton(0)) {
        var x=g_mouse.cursor_pos[0]-SCRW/2;
        var y=SCRH/2-g_mouse.cursor_pos[1];
        console.log("mousebutton0:",x,y);
    }
    if(g_touch.touching) {
        var x=g_touch.last_touch_pos[0]-SCRW/2;
        var y=SCRH/2-g_touch.last_touch_pos[1];
        console.log("touchat:",x,y);
    }
    var now_time = new Date().getTime();
    var dt = now_time - last_anim_at;
    last_anim_at = now_time;
    Moyai.poll(dt/1000.0);
    Moyai.render();
}

animate();

///////////

//////////////
function findEntity(eid) {
    for(var i=0;i<g_main_layer.props.length;i++) {
        var p=g_main_layer.props[i];
        if(p.entity_id==eid) return p;
    }
    return null;
}
function createEntity(id,type,fld_x,fld_y) {
    var p = new Prop2D();
    p.setDeck(g_base_deck);
    var ind=96;
    if(type==ENTITY_PC) ind=0;
    else if(type==ENTITY_SKELETON) ind=64;
    p.setIndex(ind);
    p.setScl(20,20);
    p.setFldLoc = function(fx,fy) {
        p.setLoc(-SCRW/2+10+fx*20,-SCRH/2+10+fy*20);        
    };
    p.setFldLoc(fld_x,fld_y);
    p.entity_id=id;
    p.entity_type=type;
    p.fld_x=fld_x;
    p.fld_y=fld_y;
    g_main_layer.insertProp(p);
    return p;
}

//////////

function loginPressed() {
    var input=document.getElementById("loginname");
    send_login(g_ws, input.value);
}

  