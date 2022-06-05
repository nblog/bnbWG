#!C:/Python/Python38/python
# -*- coding: utf-8 -*-


import os, sys

from common.friMgr import frida_base_initialize as frida_init

import keyboard



def main():

    ''' run administrator '''
    cli = frida_init( "CA.exe", os.path.join("temp", "bnbWG.js") )

    # cli.rpc("start")()


    # 1新飞碟 2猫头鹰 3慢乌龟 4海盗龟 5坏飞机 
    # 6慢章鱼 7海盗章鱼 8矿车 9泡面桶 10赛车(普通) 11赛车(加速) 12坦克 13毛毛虫 14章鱼炮台(普通) 15章鱼炮台(加速) 16鲨鱼 17龙头
    keyboard.add_hotkey("f2", lambda: cli.rpc("car")(17))


    # Block forever, like `while True`.
    keyboard.wait()


if __name__ == "__main__":
    main()