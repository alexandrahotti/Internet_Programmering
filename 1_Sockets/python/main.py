import socket
import sys
from socket_wrapper import SocketWrapper
from random import randint
from _thread import *
import collections
import re

user_data = {
    'guesses': 0,
    'low_guess': 1,
    'high_guess': 100,

}

server_data = {
    'session_id': 1,
}

# {'SessionId' {
#           'guesses':  [10, 20, 30]
#           'low_guess':
#           'high_guess':
#           'answer':
#      }
# }
cookies = collections.defaultdict(dict)

def create_cookie():
    cookies[server_data['session_id']]['guesses'] = []
    cookies[server_data['session_id']]['low_guess'] = 1
    cookies[server_data['session_id']]['high_guess'] = 100
    cookies[server_data['session_id']]['answer'] = randint(1, 100)

    cookie = 'Set-Cookie: sessionId={}'.format(server_data['session_id'])
    server_data['session_id'] += 1
    return cookie

def create_start_page_response(session_id):
    cookie = ''
    if(session_id == 0):  # No cookie found
        cookie = create_cookie()
    else:
        if session_id not in cookies:
            print("Invalid cookie. Generating new...")
            cookie = create_cookie()
        else:
            # Don't need to handle this case atm. Firefox post thingy.
            cookie = create_cookie()


    response_body_file = open("welcome.html", "rb")
    response_body = response_body_file.read().decode("utf-8")

    response_header = 'HTTP/1.1 200 OK\r\n' \
    + 'Content-Type: text/html\r\n' \
    + 'Content-Length: {}\r\n'.format(len(response_body)) \
    + cookie
    end_of_response_header = '\r\n\r\n'
    return response_header, end_of_response_header, response_body

def create_guess_page_response(session_id, msg):

    response_body_file = open("guess.html", "rb")
    response_body = response_body_file.read().decode("utf-8").format(msg, cookies[session_id]['low_guess'] \
                    , cookies[session_id]['high_guess'], len(cookies[session_id]['guesses']))

    response_header = 'HTTP/1.1 200 OK\r\n' \
    + 'Content-Type: text/html\r\n' \
    + 'Content-Length: {}\r\n'.format(len(response_body))

    end_of_response_header = '\r\n\r\n'
    return response_header, end_of_response_header, response_body

def create_you_won_page_response(session_id):

    response_body_file = open("you_won.html", "rb")
    response_body = response_body_file.read().decode("utf-8").format(len(cookies[session_id]['guesses']))

    response_header = 'HTTP/1.1 200 OK\r\n' \
    + 'Content-Type: text/html\r\n' \
    + 'Content-Length: {}\r\n'.format(len(response_body)) \
    + 'Set-Cookie: sessionId=0' #invalid

    end_of_response_header = '\r\n\r\n'
    return response_header, end_of_response_header, response_body

def read_header(line, socket_wrapper):
    session_id = 0
    print("---Header---")
    while line != '':
        print(line)
        line = socket_wrapper.read_line()
        if(re.match('Cookie:', line)):
            session_id = int("".join(re.findall(r'\d+', line)))
    print("---Header Ends---\r\n")

    return session_id


def clientThread(clientsocket):
    print("Client thread initiated\r\n")
    # while True:
    # Wrap in provided wrapper to make interacting with the socket nicer
    socket_wrapper = SocketWrapper(clientsocket)

    line = socket_wrapper.read_line().split()


    if(line[0] == 'GET'):
        session_id = read_header(line, socket_wrapper)

        if(line[1] == '/'):
            response_header, end_of_response_header, response_body = create_start_page_response(session_id)
            socket_wrapper.send(response_header + end_of_response_header + response_body)


    elif(line[0] == 'POST'):

        session_id = read_header(line, socket_wrapper)

        print("---Payload---")
        byte = clientsocket.recv(4096)
        payload = str(byte, "utf-8")
        print(payload)
        print("---Payload Ends---\r\n")

        guess = int("".join(re.findall(r'\d+', payload)))

        cookies[session_id]['guesses'].append(guess)

        if(guess < cookies[session_id]['answer']):
            cookies[session_id]['low_guess'] = guess
            msg = "too low"

            response_header, end_of_response_header, response_body = create_guess_page_response(session_id, msg)
            socket_wrapper.send(response_header + end_of_response_header + response_body)

        elif(guess > cookies[session_id]['answer']):
            cookies[session_id]['high_guess'] = guess
            msg = "too high"

            response_header, end_of_response_header, response_body = create_guess_page_response(session_id, msg)
            socket_wrapper.send(response_header + end_of_response_header + response_body)

        else:
            response_header, end_of_response_header, response_body = create_you_won_page_response(session_id)
            socket_wrapper.send(response_header + end_of_response_header + response_body)



    socket_wrapper.close()

def main():
    # create an INET, STREAMing socket
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # bind the socket to a public host, and a well-known port
    server_address = ('localhost', 8989)
    print(f"starting up on {server_address[0]} port {server_address[1]}", file=sys.stderr)
    serversocket.bind(server_address)

    # Start listening for connections
    # We allow up to 5 waiting requests before refusing connections
    serversocket.listen(5)
    while True:
        print("Waiting for connections", file=sys.stderr)
        (clientsocket, address) = serversocket.accept()
        print(clientsocket)
        print(address)
        print(f"Connection from {address}\r\n", file=sys.stderr)

        start_new_thread(clientThread, (clientsocket,))
    print('not true')
    serversocket.close()

if __name__ == "__main__":
    main()
