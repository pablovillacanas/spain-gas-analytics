from extensions import db


# create view prices_evolution as select date, avg(biodiesel) as biodiesel, avg(bioethanol) as bioethanol, avg(compressed_natgas) as compressed_natgas, avg(liq_natgas) as liq_natgas, avg(liq_gas_from_oil) as liq_gas_from_oil, avg(diesel_a) as diesel_a, avg(diesel_b) as diesel_b, avg(diesel_prem) as diesel_prem, avg(gasoline_95e10) as gasoline_95e10, avg(gasoline_95e5) as gasoline_95e5, avg(gasoline_95e5prem) as gasoline_95e5prem, avg(gasoline_98e10) as gasoline_98e10, avg(gasoline_98e5) as gasoline_98e5, avg(h) as h from prices group by date;
class PriceEvolutionView(db.Model):
    __tablename__ = 'prices_evolution'

    date = db.Column(db.DateTime, nullable=True, primary_key=True)
    biodiesel = db.Column(db.Float, nullable=True)
    bioethanol = db.Column(db.Float, nullable=True)
    compressed_natgas = db.Column(db.Float, nullable=True)
    liq_natgas = db.Column(db.Float, nullable=True)
    liq_gas_from_oil = db.Column(db.Float, nullable=True)
    diesel_a = db.Column(db.Float, nullable=True)
    diesel_b = db.Column(db.Float, nullable=True)
    diesel_prem = db.Column(db.Float, nullable=True)
    gasoline_95e10 = db.Column(db.Float, nullable=True)
    gasoline_95e5 = db.Column(db.Float, nullable=True)
    gasoline_95e5prem = db.Column(db.Float, nullable=True)
    gasoline_98e10 = db.Column(db.Float, nullable=True)
    gasoline_98e5 = db.Column(db.Float, nullable=True)
    h = db.Column(db.Float, nullable=True)
