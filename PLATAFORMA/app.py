from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_pymongo import PyMongo
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/plataforma_estudos")
mongo = PyMongo(app)

@app.route('/')
def index():
    return render_template('index.html')

# --- Event Endpoints ---
@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        events = list(mongo.db.events.find())
        for event in events:
            event['_id'] = str(event['_id'])
        return jsonify(events)
    except Exception as e:
        print(f"Error in /api/events GET: {e}")
        return jsonify({'message': 'Erro ao obter eventos'}), 500

@app.route('/api/events', methods=['POST'])
def create_event():
    try:
        data = request.get_json()
        # Adicionar timestamp
        data['created_at'] = datetime.utcnow()
        result = mongo.db.events.insert_one(data)
        return jsonify({
            'success': True,
            'event_id': str(result.inserted_id),
            'message': 'Evento criado com sucesso'
        })
    except Exception as e:
        print(f"Error creating event: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao criar evento'
        }), 500

# --- Note Endpoints ---

@app.route('/api/notas', methods=['GET'])
def get_notas():
    try:
        notas = list(mongo.db.grades.find())
        for nota in notas:
            nota['_id'] = str(nota['_id'])
        return jsonify(notas)
    except Exception as e:
        print(f"Error in /api/notas GET: {e}")
        return jsonify({'message': 'Erro ao obter notas'}), 500

@app.route('/api/notas', methods=['POST'])
def create_nota():
    try:
        data = request.get_json()
        result = mongo.db.grades.insert_one(data)
        return jsonify({'success': True, 'nota_id': str(result.inserted_id)})
    except Exception as e:
        print(f"Error in /api/notas POST: {e}")
        return jsonify({'message': 'Erro ao criar nota'}), 500

@app.route('/api/notas', methods=['POST'])
def save_notas():
    try:
        data = request.get_json()
        data['created_at'] = datetime.utcnow()
        
        # Calcular média total
        notas = [
            data.get('matematica', 0),
            data.get('humanas', 0),
            data.get('naturezas', 0),
            data.get('linguagens', 0),
            data.get('redacao', 0)
        ]
        data['media_total'] = sum(notas) / len(notas) if notas else 0
        
        result = mongo.db.grades.insert_one(data)
        return jsonify({
            'success': True,
            'message': 'Notas salvas com sucesso',
            'nota_id': str(result.inserted_id)
        })
    except Exception as e:
        print(f"Error saving grades: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# --- Student Endpoints (FIXED) ---

@app.route('/api/students', methods=['POST'])
def register_student():
    try:
        data = request.get_json()
        required_fields = ['email', 'nome']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Campos obrigatórios ausentes'}), 400

        if mongo.db.students.find_one({'email': data['email']}):
            return jsonify({'success': False, 'message': 'Aluno já cadastrado'}), 400

        result = mongo.db.students.insert_one(data)
        return jsonify({'success': True, 'student_id': str(result.inserted_id)}), 201
    except Exception as e:
        print(f"Error in /api/students POST: {e}")  # Log the actual error
        return jsonify({'message': 'Erro ao cadastrar aluno'}), 500  # Consistent error message


@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        students = list(mongo.db.students.find())
        return jsonify({
            'success': True,
            'students': [{**student, '_id': str(student['_id'])} for student in students]
        })
    except Exception as e:
        print(f"Error in get_students: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Adicionar error handler global
@app.errorhandler(500)
def handle_500_error(e):
    return jsonify({
        'success': False,
        'message': 'Erro interno do servidor',
        'error': str(e)
    }), 500

@app.route('/api/aluno-info', methods=['POST'])
def save_aluno_info():
    try:
        data = request.get_json()
        
        # Atualizar ou criar novo documento
        mongo.db.aluno_info.update_one(
            {},
            {'$set': data},
            upsert=True
        )
        
        return jsonify({'success': True, 'message': 'Informações salvas com sucesso'})
    except Exception as e:
        print(f"Error saving aluno info: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/save-cell', methods=['POST'])
def save_cell():
    try:
        data = request.get_json()
        
        # Salvar conteúdo da célula
        mongo.db.cells.update_one(
            {
                'row': data['row'],
                'column': data['column']
            },
            {'$set': {'content': data['content']}},
            upsert=True
        )
        
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error saving cell: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tags', methods=['GET'])
def get_tags():
    try:
        tags = mongo.db.tags.find_one({})
        if (tags):
            tags['_id'] = str(tags['_id'])
            return jsonify({'success': True, 'tags': tags['data']})
        return jsonify({'success': True, 'tags': {'disciplinas': [], 'pontos': []}})
    except Exception as e:
        print(f"Error fetching tags: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tags', methods=['POST'])
def save_tags():
    try:
        data = request.get_json()
        mongo.db.tags.update_one(
            {},
            {'$set': {'data': data['tags']}},
            upsert=True
        )
        return jsonify({'success': True, 'message': 'Tags salvas com sucesso'})
    except Exception as e:
        print(f"Error saving tags: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)