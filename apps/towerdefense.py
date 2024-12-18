from flask import Blueprint, render_template, request
from flask_login import login_required, current_user
from apps.lobby import socketio, emit



towerdefense_bp = Blueprint('towerdefense', __name__)


@towerdefense_bp.route('/study/decks/<int:id>/play/tower-defense')
@login_required
def tower_defense(id):
    return render_template('study/play/tower-defense.html', deckId=id, username=current_user.username)



@socketio.on('td-start_game')
def start_game(room):
    emit('start_game', room=f'game_{room}')


@socketio.on('td-balloon_target_change')
def balloon_target_change(data):
    balloonIndex = data['balloon']
    positionIndex = data['position']
    room = data['room']
    _map = data['map']

    emit('td-balloon_target_change',
         {
             'map':_map,
             'balloonIndex':balloonIndex,
             'positionIndex':positionIndex
         },
         room=f'game_{room}')


@socketio.on('td-pop_balloon')
def pop_balloon(data):
    emit('td-pop_balloon', data, room=f'game_{data['room']}')


@socketio.on('td-update_health')
def update_health(data):
    emit('td-update_health', data, room=f'game_{data['room']}')

@socketio.on('td-update_wave')
def update_wave(data):
    emit('td-update_wave', data, room=f'game_{data['room']}')

@socketio.on('td-add_coins')
def update_wave(data):
    emit('td-add_coins', data, room=f'game_{data['room']}')

@socketio.on('td-place_building')
def place_building(data):
    emit('td-place_building', data, room=f'game_{data['room']}')

@socketio.on('td-spawn_balloon')
def spawn_balloon(data):
    emit('td-spawn_balloon', data, room=f'game_{data['room']}')