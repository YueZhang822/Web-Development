import string
import random
from datetime import datetime
from flask import Flask, g, jsonify, request, make_response, redirect, request
from functools import wraps
import json
import sqlite3

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/watchparty.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

def new_user():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (name, password, api_key),
        one=True)
    return u

def get_user_from_cookie(request):
    user_name = request.cookies.get('name')
    password = request.cookies.get('password')
    if user_name and password:
        return query_db('select * from users where name = ? and password = ?', [user_name, password], one=True)
    return None

# TODO: If your app sends users to any other routes, include them here.
#       (This should not be necessary).
@app.route('/')
@app.route('/profile')
@app.route('/login')
@app.route('/room')
def index(chat_id=None):
    return app.send_static_file('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404


def verify_api_key(key):
    # Check if the API key is valid by querying the database
    result = query_db('SELECT COUNT(*) FROM users WHERE api_key = ?', [key], one=True)
    if result and result[0] > 0:
        return True
    else:
        return False


# -------------------------------- API ROUTES ----------------------------------


# signup API endpoint creates a new user in the database and returns an API key for that user. 
# Store the API key in the user's browser.
@app.route('/api/signup', methods=['POST'])
def signup():
    # Create a new user
    user = new_user()

    # Store the name, password, and API key in the user's browser by setting cookies
    response = make_response(jsonify({'message': 'User created.', 'api_key': user['api_key']}), 201)
    response.set_cookie('name', user['name'])
    response.set_cookie('password', user['password'])
    response.set_cookie('api_key', user['api_key'])
    
    return response


# Login API endpoint that accepts a username and password and returns an API key for that user.
@app.route('/api/login', methods=['POST'])
def login():
    # Check if the username and password are in the request body
    if request.json and 'username' in request.json and 'password' in request.json:
        username = request.json['username']
        password = request.json['password']
    else:
        return jsonify({'message': 'Username and password not found.'}), 400

    # Check if the username and password are valid
    user = query_db('select * from users where name = ? and password = ?',
        (username, password),
        one=True)
    if user is None:
        return jsonify({'message': 'Username and password do not match.'}), 400

    # Store the name, password, and API key in the user's browser by setting cookies
    response = make_response(jsonify({'message': 'User logged in.', 'api_key': user['api_key']}), 200)
    response.set_cookie('name', user['name'])
    response.set_cookie('password', user['password'])
    response.set_cookie('api_key', user['api_key'])
    
    return response


@app.route('/api/logout', methods=['GET'])
def logout():
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            resp = make_response(redirect('/'))
            resp.set_cookie('name', '')
            resp.set_cookie('password', '')
            resp.set_cookie('api_key', '')
            return resp
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401


@app.route('/api/update_username', methods=['POST'])
def update_username():
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            # Get the username from the request body
            data = request.get_json()
            new_username = data.get('new_username')
            print(f'new_username: {new_username}')

            # Check that the new username is not empty and not the same as the current username in the cookie
            current_username = request.cookies.get('name')
            print(f'current_username: {current_username}')
            if not new_username or new_username == current_username:
                print('Invalid username')
                return jsonify({'error': 'Invalid username'}), 400

            # Update the username in the database
            print('Updating username in database')
            query_db('update users set name = ? where name = ?', (new_username, current_username))
            print('Username updated in database')

            # Set the new username in a cookie
            resp = jsonify({'message': 'Username updated'})
            resp.set_cookie('name', new_username)
            print('New username set in cookie')
            return resp
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401


@app.route('/api/update_password', methods=['POST'])
def update_password():
    # Get the username from the request body
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            data = request.get_json()
            new_password = data.get('new_password')
            print(f'new_password: {new_password}')

            # Check that the new password is not empty and not the same as the current password in the cookie
            current_password = request.cookies.get('password')
            print(f'current_password: {current_password}')
            user = request.cookies.get('name')
            print(f'user: {user}')
            if not new_password or new_password == current_password:
                print('Invalid password')
                return jsonify({'error': 'New password can not be empty or the same.'}), 400

            # Update the password in the database
            query_db('update users set password = ? where name = ?', (new_password, user))
            print('Password updated in database')

            # Set the new password in a cookie
            resp = jsonify({'message': 'Password updated'})
            resp.set_cookie('password', new_password)
            print('New password set in cookie')
            return resp
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401


@app.route('/api/room/create', methods=['POST'])
def create_room():
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        if verify_api_key(api_key):
            name = "Unnamed Room " + ''.join(random.choices(string.digits, k=6))
            room = query_db('insert into rooms (name) values (?) returning id', [name], one=True)         
            room_id = room[0]  # get the room ID from the query result
            return jsonify({'message': 'Room created.', 'id': room_id}), 201
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401

# get_roomlist
@app.route('/api/room/list', methods=['GET'])
def get_roomlist():
    rooms = query_db('select * from rooms')
    room_list = []
    for room in rooms:
        room_dict = dict(room)
        room_list.append(room_dict)

    # Convert the list of dictionaries to a JSON-formatted string
    json_string = json.dumps(room_list)

    return json_string, 200

# get_messages
@app.route('/api/room/<int:room_id>/messages', methods=['GET'])
def get_messages(room_id):
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            try:
                room = query_db('select * from rooms where id = ?', [room_id], one=True)
                if room is None:
                    return jsonify({'message': 'Room not found'}), 404

                messages = query_db('select * from messages where room_id = ?', [room_id])
                if messages is None:
                    return jsonify({'message': 'No messages found'}), 200

                message_list = []
                for message in messages:
                    message_dict = dict(message)
                    user = query_db('select * from users where id = ?', [message['user_id']], one=True)
                    if user is not None:
                        message_dict['username'] = user['name']
                    message_list.append(message_dict)

                # Convert the list of dictionaries to a JSON-formatted string
                json_string = json.dumps(message_list)
                print(f"json_string: {json_string}")

                return json_string, 200
            except Exception as e:
                print(f"Exception in get_messages: {e}")
                return jsonify({'message': 'Error getting messages'}), 500
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401

# change_room_name
@app.route('/api/room/<int:room_id>/name', methods=['POST'])
def change_room_name(room_id):
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            data = request.get_json()
            new_roomname = data.get('new_roomname')

            room = query_db('select * from rooms where id = ?', [room_id], one=True)
            if room is None: return {}, 404

            query_db('update rooms set name = ? where id = ?', [new_roomname, room_id])
            resp = jsonify({'message': 'Room name changed.', 'new_roomname': new_roomname}), 201
            return resp
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401

# post_message
@app.route('/api/room/<int:room_id>/messages', methods=['POST'])
def post_message(room_id):
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        # Verify the API key here
        if verify_api_key(api_key):
            user = get_user_from_cookie(request)
            room = query_db('select * from rooms where id = ?', [room_id], one=True)
            print(room_id)
            if room is None: return {}, 404

            data = request.get_json()
            message = data.get('message')
            if not message: return {}, 400

            query_db('insert into messages (user_id, room_id, body) values (?, ?, ?)', [user['id'], room_id, message])
            result = query_db('select * from messages where id = last_insert_rowid()')
            message_dict = dict(result[0])

            # Get the name of the user and add it to the message_dict
            user_result = query_db('select name from users where id = ?', [user['id']], one=True)
            if user_result is not None:
                message_dict['user_name'] = user_result['name']

            # Convert the dictionary to a JSON-formatted string
            message_json = json.dumps(message_dict)

            # Return the message as a JSON-formatted string
            return message_json, 201
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401


@app.route('/api/room/<int:room_id>/info', methods=['GET'])
def get_room_info(room_id):
    api_key = request.headers.get('Authorization')
    if api_key and api_key.startswith('Bearer '):
        api_key = api_key[7:]
        if verify_api_key(api_key):
            try:
                room = query_db('select * from rooms where id = ?', [room_id], one=True)
                if room is None:
                    return jsonify({'message': 'Room not found'}), 404

                room_dict = dict(room)
                print(room_dict)
                return jsonify(room_dict), 200
            except Exception as e:
                print(f"Exception in get_room_info: {e}")
                return jsonify({'message': 'Error getting room info'}), 500
        else:
            return jsonify({'message': 'Invalid API key.'}), 401
    else:
        return jsonify({'message': 'API key is missing.'}), 401
    