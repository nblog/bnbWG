///<reference path='index.d.ts'/>

const ptrlength = Process.pointerSize;




/* assert */
function assert (condition, msg) { if (!condition) throw new Error(`[ass] ${msg}`) };




function symbols() {

    return {

        "module": Process.enumerateModules()[0],

        "calls": {

            "gaming": {
                "aob" : {
                    "notes": "",
                    "mode": "call", 
                    "offset": ptr(0x35), 
                    "pattern": "6A 02 E8 ?? ?? ?? ?? 83 C4 04 39 45 F8 75 07 B8 01 00 00 00 EB 02 33 C0"
                },
                "value": 0x1BFDD15,
            },


            "roles_object_call": {
                "aob" : {
                    "notes": "",
                    "mode": "call", 
                    "offset": ptr(3), 
                    "pattern": "8B 4D F4 E8 ?? ?? ?? ?? 8B C8 E8 ?? ?? ?? ?? 89 45 F0 83 7D F0 00 75 02"
                },
                "value": 0xAF0390,
            },

            "role_object_call": {
                "aob" : {
                    "notes": "",
                    "mode": "rva", 
                    "offset": -ptr(0x19), 
                    "pattern": "00 74 1D 8B 4D 08 51 E8"
                },
                "value": 0x8BA1A0,
            },

            "positiont_call": {
                "aob" : {
                    "notes": "",
                    "mode": "rva", 
                    "offset": -ptr(0x41), 
                    "pattern": "8B 50 38 FF D2 85 C0 74 08 8B 4D FC E8"
                },
                "value": 0x5FAB30,
            },

            "car_call": {
                "aob" : {
                    "notes": "",
                    "mode": "rva", 
                    "offset": -ptr(0x3c), 
                    "pattern": "FF D0 89 45 F8 83 7D F8 FF 75 07 33 C0 E9"
                },
                "value": 0x5FE2C0,
            },

            "pickup_call": {
                "aob" : {
                    "notes": "",
                    "mode": "rva", 
                    "offset": ptr(0x11), 
                    "pattern": "8D 4D D8 51 8B 55 F8 8B 02 8B 4D F8 8B 50 64 FF D2"
                },
                "value": 0x62C34E,
            },
        },

        "offsets": {

            "role_opt_offset": {
                "value": 0x584,
            },

            /* test eax, eax */
            "gaming_jcc1_offset": {
                "value": 0x95,
            },
            "gaming_jcc2_offset": {
                "value": 0x234,
            },

        }

    }

}




var bnbWG = symbols();
function relocator_addr(rva) {
    assert( 0 < Number(rva), "impossible" )
    return ptr(bnbWG.module.base).add(rva);
}




function get_bnb_main_object() {
    let roles_object = new NativeFunction(
        relocator_addr( bnbWG.calls.roles_object_call.value ), 
        "pointer", [], "thiscall");

    let role_object = new NativeFunction(
        relocator_addr( bnbWG.calls.role_object_call.value ), 
        "pointer", ["pointer", "uint"], "thiscall");

    return role_object(roles_object(), 0);
}

function get_main_pos() {
    let pos = Memory.alloc(8);
    let vtablefn = get_bnb_main_object().readPointer().add(30 * ptrlength).readPointer();
    new NativeFunction(
        vtablefn, "void", [ "pointer", "pointer" ], "thiscall"
    )(get_bnb_main_object(), pos);

    return { "pixelX": pos.add(0).readU32(), "pixelY": pos.add(4).readU32() };
}

function get_main_posXY() {
    /*
    let bnb = get_bnb_main_object().add(bnbWG.offsets.role_opt_offset.value);
    
    let posXY = Memory.alloc(8);
    let vtablefn = bnb.readPointer().add(25 * ptrlength).readPointer();
    new NativeFunction(
        vtablefn, "void", [ "pointer", "pointer" ], "thiscall"
    )(bnb, posXY);

    return { "X": posXY.add(0).readU32(), "Y": posXY.add(4).readU32() };
    */

    let pixel = get_main_pos();
    return { "X": Math.floor(pixel.pixelX / 40), "Y": Math.floor(pixel.pixelY / 40) };
}

function pickup_all_items() {

    let pickup_wrapper = Memory.alloc(Process.pageSize);

    Memory.patchCode(pickup_wrapper, 100, code => {
        const cw = new X86Writer(code, { pc: pickup_wrapper });
        /*
            push ebp
            mov ebp,esp
            sub esp, 0x40
            mov dword ptr ss:[ebp-0x8],ecx
        */
        cw.putPushReg('ebp');
        cw.putMovRegReg('ebp', 'esp');
        cw.putSubRegImm('esp', 0x40);
        cw.putMovRegOffsetPtrReg('ebp', -0x8, 'ecx');
        /*
            lea ecx, dword ptr ss:[ebp-0x28]
            mov eax, dword ptr ss:[ebp+0x8]
            mov dword ptr ss:[ecx], eax
            mov eax, dword ptr ss:[ebp+0xC]
            mov dword ptr ss:[ecx+4], eax
        */
        cw.putLeaRegRegOffset("ecx", "ebp", -0x28);
        cw.putMovRegRegOffsetPtr("eax", "ebp", 0x8);
        cw.putMovRegOffsetPtrReg("ecx", 0, "eax");
        cw.putMovRegRegOffsetPtr("eax", "ebp", 0xC);
        cw.putMovRegOffsetPtrReg("ecx", 4, "eax");
        /*
            jmp pickup_call
        */
        cw.putJmpAddress( relocator_addr(bnbWG.calls.pickup_call.value) );

        cw.flush();
    });

    let pickup = new NativeFunction(pickup_wrapper, 
        "void", [ "pointer", "uint32", "uint32" ], "thiscall"
    );

    /* map: 14 x 14 */
    for (let intX = 0; intX < 14; intX++) {
        for (let intY = 0; intY < 14; intY++) {
            pickup(get_bnb_main_object().add( bnbWG.offsets.role_opt_offset.value ), intX, intY);
        }
    }

    pickup_wrapper = undefined;

    return;
}



let enable_shield = false;

function progress() {

    let gaming = relocator_addr( bnbWG.calls.gaming.value );

    /*
    Interceptor.attach(gaming.add( bnbWG.offsets.gaming_jcc1_offset.value ), { 
        onEnter: function (args) {

            if (8 < bnbcount) return;

            if (8 == bnbcount) {
                setTimeout(() => {
                    pickup_all_items(); console.log("done");
                }, 6 * 1000);
            }

            ++bnbcount;

            this.bnb_object = this.context.ebp.sub(ptrlength).readPointer();
            if ( 0 == get_bnb_main_object().compare(this.bnb_object) ) {
                new NativeFunction(
                    relocator_addr(bnbWG.calls.car_call.value),
                    "void", ["pointer", "uint", "uint", "uint"] , "thiscall"
                )(this.bnb_object, 3, 0, 40);
            }
            else {
                new NativeFunction(
                    relocator_addr(bnbWG.calls.positiont_call.value),
                    "void", ["pointer", "uint", "uint"] , "thiscall"
                )(this.bnb_object, 0, 40);
            }
        },
        onLeave: function (retval) {
        }
    });

    setInterval(() => {
        try {
            get_bnb_main_object();
        } catch (error) {
            bnbcount = 0; // leave room
        }
    }, 1 * 1000);
    */

    Interceptor.attach(gaming.add( bnbWG.offsets.gaming_jcc1_offset.value ), { 
        onEnter: function (args) {

            this.bnb_object = this.context.ebp.sub(ptrlength).readPointer();
            if ( 0 == get_bnb_main_object().compare(this.bnb_object) ) {
                this.context.eax = ptr(0);
            }
        },
        onLeave: function (retval) {
        }
    });

    Interceptor.attach(gaming.add( bnbWG.offsets.gaming_jcc2_offset.value ), { 
        onEnter: function (args) {

            this.bnb_object = this.context.ebp.sub(ptrlength).readPointer();
            if ( enable_shield && 0 == get_bnb_main_object().compare(this.bnb_object) ) {
                this.context.eax = ptr(0);
            }
        },
        onLeave: function (retval) {
        }
    });
}



rpc.exports = {
    stop() {
        
    },
    start() {
        progress();
    },

    car(idx=4) {
        let pixel = get_main_pos();
        new NativeFunction(
            relocator_addr(bnbWG.calls.car_call.value),
            "void", ["pointer", "uint", "uint", "uint"] , "thiscall"
        )(get_bnb_main_object(), idx, pixel.pixelX, pixel.pixelY);

        enable_shield = !enable_shield;
    },

    pickup() {
        pickup_all_items();
    },

}

