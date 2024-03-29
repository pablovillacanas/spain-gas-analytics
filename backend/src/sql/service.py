from datetime import datetime
from typing import List

from extensions import db
from geoalchemy2.elements import WKTElement
from geoalchemy2.types import Geography
from sqlalchemy import func
from sqlalchemy.sql import cast
from sqlalchemy.sql.elements import and_
from sqlalchemy.sql.operators import desc_op

from sql.models import GasStation, Prices

from .views import PriceEvolutionView


def persist(gas_stations: List[GasStation]):
    for idx, gas_station in enumerate(gas_stations):
        gs = db.session.query(GasStation).get(gas_station.id)
        print(idx, "--", len(gas_stations))
        if not (gs):
            db.session.add(gas_station)
            if idx % 100 == 0:
                db.session.commit()
            continue
        gs.prices.extend(gas_station.new_prices)
        if idx % 100 == 0:
            db.session.commit()
    db.session.commit()


def get(gas_station_id):
    gs = db.session.query(GasStation).join(Prices). \
        where(GasStation.id == gas_station_id) \
        .first()
    db.session.commit()
    return gs


def get_all():
    result = db.session.query(GasStation)\
        .filter(and_(GasStation.coordinates != None, GasStation.prices != None))
    print(result)
    db.session.commit()
    return result.all()


def get_price_evolution():
    result = db.session.query(PriceEvolutionView)
    db.session.commit()
    return result.all()


def get_prices():
    result = db.session.query(Prices).filter(
        Prices.date > datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat())
    db.session.commit()
    return result.all()


def get_last_price_date():
    result = db.session.query(
        Prices.date).distinct().order_by(desc_op(Prices.date)).limit(1)
    db.session.commit()
    return result.scalar()


def to_WKTElement(point):
    """
    Point in lng,lat format
    """
    return WKTElement(
        f"POINT({point.split(',')[0]} {point.split(',')[1]})", srid=4269)


def find_closest_gasstations(origin, page):
    print(origin, page)
    if page is None:
        page = 1
    result = db.session\
        .query(GasStation).order_by(func.ST_Distance(GasStation.coordinates, cast(to_WKTElement(origin), Geography(srid=4269))))\
        .paginate(page, 20)
    db.session.commit()
    return result
