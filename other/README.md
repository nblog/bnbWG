## open multiple games (only test in "泡泡堂")
### 1. mutex:
#### Hook "ntdll.dll!ZwCreateMutant"
onEnter: ObjectAttributes.ObjectName.Buffer == "Global\FxClientMutex" == '\u0000'

### 2. physical address:
#### Hook "Iphlpapi.dll!GetAdaptersInfo"
onLeave: AdapterInfo.Address[AdapterInfo.AddressLength] == random physical address

### 3. volume serial number:
#### Hook "ntdll.dll!NtQueryVolumeInformationFile"
onLeave: FileFsVolumeInformation == FsInformationClass && \
FILE_FS_VOLUME_INFORMATION(FsInformation).VolumeSerialNumber == random volume serial number

## ...
