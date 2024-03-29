import logging
import os
from dotenv import load_dotenv, find_dotenv

from sql.service import persist as insert_in_postgres, get_last_price_date
from spider.service import fetch
from adapters import rest_response_to_normalized
from datetime import datetime
from flask import Flask
from config import initConfiguration
from extensions import db


def fetch_and_persist():
    logging.debug('Try to fetch and persist')
    if get_last_price_date().date() != datetime.utcnow().date():
        logging.info(
            "Last price update differs from today UTC")
        logging.info("Fetching remote data given by government")
        rest_response = fetch()
        logging.info("Fetching remote data given by government")
        logging.info("Persisting in postgres the data")
        insert_in_postgres(rest_response_to_normalized(rest_response))
        logging.info("Updated database!")
    else:
        logging.info("Database is updated")


if __name__ == '__main__':
    app = Flask(__name__)
    load_dotenv()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = {
        os.environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')}
    print(os.environ.get('DATABASE_URL'))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    db.init_app(app)
    initConfiguration()
    with app.app_context():
        fetch_and_persist()
