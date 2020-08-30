#!/usr/bin/python
# -*- coding: utf-8 -*-
from __future__ import print_function
import os
import sys
import json
import time

# hotkey & memory
import keyboard
from pymem import Pymem




class gamefunc(object):

    egg_exit = bytes(b'\x90\x90')

    tankCodes = bytes(b'\x90\x90')
    bombCodes = bytes(b'\x90\x90')

    shieldCodes = bytes(b'\x90\x90\x90\x90\x90\x90')
    shieldCodes2 = bytes(b'\x90\x90\x90\x90\x90\x90')
    
    propAddr = 0
    propCodes = bytes(b'\xE9\x00\x00\x00\x00')

    mountAddr = 0
    mountCodes = bytes(b'\xE9\x00\x00\x00\x00')
    

    def translate_jmpValue(self, dst, src):
        return int((dst - src - 5)) & 0xFFFFFFFF 

    def __init__(self, processObject):
        self.pm = Pymem(processObject)
        self.baseAddr = self.pm.process_base

        self.allocAddr = self.pm.allocate(256)
        # #
        # self.propAddr = 0x01FA3F14
        # self.propCodes = bytes(b'\xE9' + self.translate_jmpValue(self.allocAddr, self.propAddr).to_bytes(4,byteorder="little"))

        #
        self.mountAddr = 0x01FA3F14
        self.mountCodes = bytes(b'\xE9' + self.translate_jmpValue(self.allocAddr, self.mountAddr).to_bytes(4,byteorder="little"))
    
    def __del__(self):
        self.pm.close_process()

    def enable_egg_exit(self, enable = 1):
        writeCodes = self.egg_exit
        self.egg_exit = self.pm.read_bytes(0x009F7054, len(writeCodes))
        self.pm.write_bytes(0x009F7054, writeCodes, len(writeCodes))
    
    def enable_tank(self, enable = 1):
        writeCodes = self.tankCodes
        self.tankCodes = self.pm.read_bytes(0x009F70EE, len(writeCodes))
        self.pm.write_bytes(0x009F70EE, writeCodes, len(writeCodes))

    def enable_bomb(self, bAuto = True):
        writeCodes = self.bombCodes
        self.bombCodes = self.pm.read_bytes(0x00D0C842, len(writeCodes))
        self.pm.write_bytes(0x00D0C842, writeCodes, len(writeCodes))
        if (bAuto):
            time.sleep(1)
            self.enable_bomb(False)

    def enable_shield(self, enable = 1):
        writeCodes = self.shieldCodes
        self.shieldCodes = self.pm.read_bytes(0x01FA3F1B, len(writeCodes))
        self.pm.write_bytes(0x01FA3F1B, writeCodes, len(writeCodes))

        writeCodes = self.shieldCodes2
        self.shieldCodes2 = self.pm.read_bytes(0x01FA4094, len(writeCodes))
        self.pm.write_bytes(0x01FA4094, writeCodes, len(writeCodes))

    # 1新飞碟 2猫头鹰 3慢乌龟 4海盗龟 5坏飞机 
    # 6慢章鱼 7海盗章鱼 8矿车 9泡面桶 10赛车(普通) 11赛车(加速) 12坦克 13毛毛虫 14章鱼炮台(普通) 15章鱼炮台(加速) 16鲨鱼 17龙头
    def enable_mount(self, index = 17):
        writeCodes = bytes(b'\x51\x50\x8D\x89' + (0).to_bytes(4,byteorder="little") + \
        # Y max:12
        b'\x68' + (36 + (36 * 1)).to_bytes(4,byteorder="little") + \
        # X max:14
        b'\x68' + (0 + (36 * 1)).to_bytes(4,byteorder="little") + \
        b'\x6A' + index.to_bytes(1,byteorder="little") + \
        b'\xB8' + (0x009C9C50).to_bytes(4,byteorder="little") + \
        b'\xFF\xD0\x58\x59')
        writeCodes += bytes(b'\xE8' + self.translate_jmpValue(0x009C4620, 
            self.allocAddr + len(writeCodes)).to_bytes(4,byteorder="little"))
        writeCodes += bytes(b'\xE9' + self.translate_jmpValue(self.mountAddr + len(self.mountCodes), 
            self.allocAddr + len(writeCodes)).to_bytes(4,byteorder="little"))
        self.pm.write_bytes(self.allocAddr, writeCodes, len(writeCodes))

        writeCodes = self.mountCodes
        self.mountCodes = self.pm.read_bytes(self.mountAddr, len(writeCodes))
        self.pm.write_bytes(self.mountAddr, writeCodes, len(writeCodes))

        time.sleep(2)
        writeCodes = self.mountCodes
        self.mountCodes = self.pm.read_bytes(self.mountAddr, len(writeCodes))
        self.pm.write_bytes(self.mountAddr, writeCodes, len(writeCodes))

    # 蛛网 电网 香蕉 钉子
    def enable_prop(self, index = 4):
        writeCodes = bytes(b'\x51\x50\x8D\x89' + (0x590).to_bytes(4,byteorder="little") + \
        b'\x6A\x00\x6A\x00\x6A\x01\x6A\x00' + \
        b'\x6A' + index.to_bytes(1,byteorder="little") + \
        b'\xB8' + (0x009CD7B0).to_bytes(4,byteorder="little") + \
        b'\xFF\xD0\x58\x59' + \
        b'\xE8' + self.translate_jmpValue(0x009C4620, self.allocAddr + 0x1B).to_bytes(4,byteorder="little") + \
        b'\xE9' + self.translate_jmpValue(self.propAddr + len(self.propCodes), self.allocAddr + 0x20).to_bytes(4,byteorder="little"))
        self.pm.write_bytes(self.allocAddr, writeCodes, len(writeCodes))

        writeCodes = self.propCodes
        self.propCodes = self.pm.read_bytes(self.propAddr, len(writeCodes))
        self.pm.write_bytes(self.propAddr, writeCodes, len(writeCodes))

        time.sleep(2)
        writeCodes = self.propCodes
        self.propCodes = self.pm.read_bytes(self.propAddr, len(writeCodes))
        self.pm.write_bytes(self.propAddr, writeCodes, len(writeCodes))
    
    def enable_site(self, x = 0, y = 36):
        writeCodes = bytes(b'\x51\x50\x8D\x89' + (0).to_bytes(4,byteorder="little") + \
        # Y max:12
        b'\x68' + (y).to_bytes(4,byteorder="little") + \
        # X max:14
        b'\x68' + (x).to_bytes(4,byteorder="little") + \
        b'\xB8' + (0x009C64C0).to_bytes(4,byteorder="little") + \
        b'\xFF\xD0\x58\x59')
        writeCodes += bytes(b'\xE8' + self.translate_jmpValue(0x009C4620, 
            self.allocAddr + len(writeCodes)).to_bytes(4,byteorder="little"))
        writeCodes += bytes(b'\xE9' + self.translate_jmpValue(self.mountAddr + len(self.mountCodes), 
            self.allocAddr + len(writeCodes)).to_bytes(4,byteorder="little"))
        self.pm.write_bytes(self.allocAddr, writeCodes, len(writeCodes))

        writeCodes = self.mountCodes
        self.mountCodes = self.pm.read_bytes(self.mountAddr, len(writeCodes))
        self.pm.write_bytes(self.mountAddr, writeCodes, len(writeCodes))

        time.sleep(2)
        writeCodes = self.mountCodes
        self.mountCodes = self.pm.read_bytes(self.mountAddr, len(writeCodes))
        self.pm.write_bytes(self.mountAddr, writeCodes, len(writeCodes))



if __name__ == "__main__":

    gamefunc = gamefunc("CA.exe")

    # keyboard.add_hotkey("f1", gamefunc.enable_bomb, args=())
    # keyboard.add_hotkey("f2", gamefunc.enable_tank, args=())
    # keyboard.add_hotkey("f3", gamefunc.enable_shield, args=())

    keyboard.add_hotkey("f1", gamefunc.enable_mount, args=())
    keyboard.add_hotkey("f2", gamefunc.enable_shield, args=())
    keyboard.add_hotkey("f3", gamefunc.enable_bomb, args=())


    # keyboard.add_hotkey("f1", gamefunc.enable_site, args=())
    
    keyboard.wait()