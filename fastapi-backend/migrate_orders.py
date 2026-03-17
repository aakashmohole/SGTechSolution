from app.db.session import engine
from app.models.order import Order, OrderItem
from app.db.base_class import Base

def migrate():
    # Since we use Base.metadata.create_all, it will only create TABLES that don't exist yet!
    # It won't drop existing ones or lose data.
    Base.metadata.create_all(bind=engine)
    print("Database tables updated. Order and OrderItem tables created successfully.")

if __name__ == "__main__":
    migrate()
