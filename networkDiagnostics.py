#################################################
#               Network Diagnostics             #
#################################################

import socket

def is_online(host="8.8.8.8", port=53, timeout=2) -> bool:
    # If user system is online or not 
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True 
    except OSError:
        return False
