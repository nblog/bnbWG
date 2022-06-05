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
                    "type": "call", 
                    "offset": ptr(0x35), 
                    "pattern": "6A 02 E8 ?? ?? ?? ?? 83 C4 04 39 45 F8 75 07 B8 01 00 00 00 EB 02 33 C0"
                },
                "rva": 0x1BF32ED,
            },


            "roles_object_call": {
                "aob" : {
                    "notes": "",
                    "type": "call", 
                    "offset": ptr(3), 
                    "pattern": "8B 4D F4 E8 ?? ?? ?? ?? 8B C8 E8 ?? ?? ?? ?? 89 45 F0 83 7D F0 00 75 02"
                },
                "rva": 0xAF0340,
            },

            "role_object_call": {
                "aob" : {
                    "notes": "",
                    "type": "rva", 
                    "offset": -ptr(0x19), 
                    "pattern": "00 74 1D 8B 4D 08 51 E8"
                },
                "rva": 0x8BA150,
            },

            "positiont_call": {
                "aob" : {
                    "notes": "",
                    "type": "rva", 
                    "offset": -ptr(0x41), 
                    "pattern": "8B 50 38 FF D2 85 C0 74 08 8B 4D FC E8"
                },
                "rva": 0x5FAB30,
            },

            "car_call": {
                "aob" : {
                    "notes": "",
                    "type": "rva", 
                    "offset": -ptr(0x3c), 
                    "pattern": "FF D0 89 45 F8 83 7D F8 FF 75 07 33 C0 E9"
                },
                "rva": 0x5FE2C0,
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
        relocator_addr( bnbWG.calls.roles_object_call.rva ), 
        "pointer", [], "thiscall");

    let role_object = new NativeFunction(
        relocator_addr( bnbWG.calls.role_object_call.rva ), 
        "pointer", ["pointer", "uint"], "thiscall");

    return role_object(roles_object(), 0);
}




function progress() {

    let gaming = relocator_addr( bnbWG.calls.gaming.rva );

    Interceptor.attach(gaming.add(0x93), { 
        onEnter: function (args) {

            this.bnb_object = this.context.ebp.sub(ptrlength).readPointer();
            if ( 0 == get_bnb_main_object().compare(this.bnb_object) ) {
                this.context.eax = ptr(0);
            }
        },
        onLeave: function (retval) {
        }
    });

    Interceptor.attach(gaming.add(0x1e1), { 
        onEnter: function (args) {

            this.bnb_object = this.context.ebp.sub(ptrlength).readPointer();
            if ( 0 == get_bnb_main_object().compare(this.bnb_object) ) {
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

    pos() {
        new NativeFunction(
            relocator_addr(bnbWG.calls.positiont_call.rva),
            "void", ["pointer", "uint", "uint"] , "thiscall"
        )(get_bnb_main_object(), 0, 36);
    },

    car(idx=7) {
        new NativeFunction(
            relocator_addr(bnbWG.calls.car_call.rva),
            "void", ["pointer", "uint", "uint", "uint"] , "thiscall"
        )(get_bnb_main_object(), idx, 0, 36);
    }
}
