import logging
import string
import traceback
import random
import sqlite3
from datetime import datetime
from flask import * # Flask, g, redirect, render_template, request, url_for
from functools import wraps
import json

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
    user_id = request.cookies.get('user_id')
    password = request.cookies.get('user_password')
    if user_id and password:
        return query_db('select * from users where id = ? and password = ?', [user_id, password], one=True)
    return None

def render_with_error_handling(template, **kwargs):
    try:
        return render_template(template, **kwargs)
    except:
        t = traceback.format_exc()
        return render_template('error.html', args={"trace": t}), 500

# ------------------------------ NORMAL PAGE ROUTES ----------------------------------

@app.route('/')
def index():
    print("index") # For debugging
    user = get_user_from_cookie(request)

    if user:
        rooms = query_db('select * from rooms')
        return render_with_error_handling('index.html', user=user, rooms=rooms)
    
    return render_with_error_handling('index.html', user=None, rooms=None)

@app.route('/rooms/new', methods=['GET', 'POST'])
def create_room():
    print("create room")
    user = get_user_from_cookie(request)
    if user is None: return {}, 403

    if (request.method == 'POST'):
        name = "Unnamed Room " + ''.join(random.choices(string.digits, k=6))
        room = query_db('insert into rooms (name) values (?) returning id', [name], one=True)            
        return redirect(f'{room["id"]}')
    else:
        return app.send_static_file('create_room.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    print("signup")
    user = get_user_from_cookie(request)

    if user:
        return render_with_error_handling('signup.html', user=user) # redirect('/')
    
    if request.method == 'POST':
        u = new_user()
        print("u")
        print(u)
        for key in u.keys():
            print(f'{key}: {u[key]}')

        resp = make_response(render_with_error_handling('signup.html', user=u))
        resp.set_cookie('user_id', str(u['id']))
        resp.set_cookie('user_password', u['password'])
        return resp
    
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    print("login")
    user = get_user_from_cookie(request)

    if user:
        return redirect('/')
    
    if request.method == 'POST':
        name = request.form['username']
        password = request.form['password']
        u = query_db('select * from users where name = ? and password = ?', [name, password], one=True)
        if u:
            resp = make_response(redirect("/"))
            resp.set_cookie('user_id', u.id)
            resp.set_cookie('user_password', u.password)
            return resp

    return render_with_error_handling('login.html', failed=True)   

@app.route('/logout')
def logout():
    resp = make_response(redirect('/'))
    resp.set_cookie('user_id', '')
    resp.set_cookie('user_password', '')
    return resp

@app.route('/rooms/<int:room_id>')
def room(room_id):
    user = get_user_from_cookie(request)
    if user is None: return redirect('/')

    room = query_db('select * from rooms where id = ?', [room_id], one=True)
    return render_with_error_handling('room.html',
            room=room, user=user)

# -------------------------------- API ROUTES ----------------------------------

# POST to change the user's name
@app.route('/api/users/name', methods=['POST'])
def change_username():
    user = get_user_from_cookie(request)
    if user is None: return {}, 403
    
    name = request.form['name']
    if not name: return {}, 400

    query_db('update users set name = ? where id = ?', [name, user['id']])
    return {}, 200


# POST to change the user's password
@app.route('/api/users/password', methods=['POST'])
def change_user_password():
    user = get_user_from_cookie(request)
    if user is None: return {}, 403

    password = request.form['password']
    if not password: return {}, 400

    query_db('update users set password = ? where id = ?', [password, user['id']])
    return {}, 200


# POST to change the name of a room
@app.route('/api/rooms/<int:room_id>/name', methods=['POST'])
def change_room_name(room_id):
    user = get_user_from_cookie(request)
    if user is None: return {}, 403

    room = query_db('select * from rooms where id = ?', [room_id], one=True)
    if room is None: return {}, 404

    name = request.form['name']
    if not name: return {}, 400

    query_db('update rooms set name = ? where id = ?', [name, room_id])
    return {}, 200


# GET to get all the messages in a room
@app.route('/api/rooms/<int:room_id>/messages', methods=['GET'])
def get_messages(room_id):
    user = get_user_from_cookie(request)
    if user is None: return {}, 403

    room = query_db('select * from rooms where id = ?', [room_id], one=True)
    if room is None: return {}, 404

    messages = query_db('select * from messages where room_id = ?', [room_id])
    message_list = []
    for message in messages:
        message_dict = dict(message)
        message_list.append(message_dict)

    # Convert the list of dictionaries to a JSON-formatted string
    json_string = json.dumps(message_list)

    return json_string, 200


# POST to post a new message to a room
@app.route('/api/rooms/<int:room_id>/messages', methods=['POST'])
def post_message(room_id):
    user = get_user_from_cookie(request)
    if user is None: return {}, 403

    room = query_db('select * from rooms where id = ?', [room_id], one=True)
    if room is None: return {}, 404

    message = request.form['comment']
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