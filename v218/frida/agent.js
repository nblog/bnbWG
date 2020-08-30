///<reference path='./index.d.ts'/>





// positiont
var set_roles_positiont = new NativeFunction(baseAddress.add(0x5C64C0), 
"void", 
["pointer", "uint", "uint"] , "thiscall");

// mount
var set_roles_mount = new NativeFunction(baseAddress.add(0x5C9C50), 
"void", 
["pointer", "uint", "uint", "uint"] , "thiscall");


// 00C82260
var get_active_roles_object = new NativeFunction(baseAddress.add(0x882260), 
"pointer", 
["pointer"], "thiscall");

// 00C81FB0
var get_safe_object = new NativeFunction(baseAddress.add(0x881FB0), 
"pointer", 
["pointer", "uint"], "thiscall");

// 00EB3090

// 00CDD5E0
var get_roles_object = new NativeFunction(baseAddress.add(0x8DD5E0), 
"pointer", 
["pointer"], "thiscall");

// 0054E730
var get_main_stage_object = new NativeFunction(baseAddress.add(0x14E730), 
"pointer", 
[], "thiscall");


function get_bnb_safe_object(index) {
    // default parameter
    index = ("undefined" != typeof index) ? index : 0;

    var main_stage = get_main_stage_object();
    var roles_object_ptr = get_roles_object(main_stage);
    return get_safe_object(roles_object_ptr, 0);
}


// gaming
Interceptor.attach(baseAddress.add(0x1BA3E59), { 
    onEnter: function (args) {

        // shield
        this.bnb_safe_object = get_bnb_safe_object();
        var bnb_safe_object = this.context.ebp.sub(0x04).readPointer();
        if (0 == bnb_safe_object.compare(this.bnb_safe_object)) {
            baseAddress.add(0x1BA3F1B).writeByteArray([0x90, 0x90, 0x90, 0x90, 0x90, 0x90]);
            baseAddress.add(0x1BA4094).writeByteArray([0x90, 0x90, 0x90, 0x90, 0x90, 0x90]);
        }
        else {
            baseAddress.add(0x1BA3F1B).writeByteArray([0x0F, 0x8C, 0xE1, 0x04, 0x00, 0x00]);
            baseAddress.add(0x1BA4094).writeByteArray([0x0F, 0x8C, 0x1B, 0x01, 0x00, 0x00]);
        }

    },
    onLeave: function (retval) {

    }
});