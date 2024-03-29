import logging
import os

from dotenv.main import load_dotenv
from flask import Flask, jsonify
from flask.helpers import send_from_directory
from flask_cors import CORS
from flask_restful import Api

import extensions
from resources import gasstations_v1_bp


def create_app():
    app = Flask(__name__, static_url_path="", static_folder='client')
    CORS(app)
    load_dotenv()
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    # app.config.from_object(settings_module)

    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    # Inicializa las extensiones
    extensions.ma.init_app(app)
    extensions.db.init_app(app)

    # Captura todos los errores 404
    Api(app, catch_all_404s=True)

    # Deshabilita el modo estricto de acabado de una URL con /
    app.url_map.strict_slashes = False

    # Registra los blueprints
    app.register_blueprint(gasstations_v1_bp)

    # Registra manejadores de errores personalizados
    register_error_handlers(app)

    @app.route("/")
    def index():
        return send_from_directory('client', "index.html")

    return app


def register_error_handlers(app):
    @app.errorhandler(Exception)
    def handle_exception_error(e):
        print(e)
        return jsonify({'msg': f'Internal backend error {e}'}), 500

    @app.errorhandler(405)
    def handle_405_error(e):
        return jsonify({'msg': 'Method not allowed'}), 405

    @app.errorhandler(403)
    def handle_403_error(e):
        return jsonify({'msg': 'Forbidden error'}), 403

    @app.errorhandler(404)
    def handle_404_error(e):
        return send_from_directory('client', "index.html")

    # @app.errorhandler(AppErrorBaseClass)
    # def handle_app_base_error(e):
    #     return jsonify({'msg': str(e)}), 500
    #
    # @app.errorhandler(ObjectNotFound)
    # def handle_object_not_found_error(e):
    #     return jsonify({'msg': str(e)}), 404


app = create_app()
