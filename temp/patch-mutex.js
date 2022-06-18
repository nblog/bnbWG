///<reference path='index.d.ts'/>

const ptrlength = Process.pointerSize;



function patch_mutex() {

    const PtrZwCreateMutant = Module.getExportByName("ntdll.dll", "ZwCreateMutant");

    const PtrGetAdaptersInfo = Module.getExportByName("Iphlpapi.dll", "GetAdaptersInfo");

    Interceptor.attach(PtrZwCreateMutant, {
        onEnter(args) {
            
        },
        onLeave(retval) {

        }
    });

    Interceptor.attach(PtrGetAdaptersInfo, {
        onEnter(args) {
            
        },
        onLeave(retval) {

        }
    });
}








