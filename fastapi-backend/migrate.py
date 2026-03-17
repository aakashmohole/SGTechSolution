from app.db.session import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as connection:
        # Add new columns
        connection.execute(text("ALTER TABLE parts ADD COLUMN IF NOT EXISTS imageUrls JSONB DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE parts ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'"))
        
        # Migrate existing imageUrl to imageUrls list
        # We check if imageUrl column exists first
        try:
            connection.execute(text("UPDATE parts SET imageUrls = jsonb_build_array(imageUrl) WHERE imageUrl IS NOT NULL AND (imageUrls IS NULL OR imageUrls = '[]'::jsonb)"))
            connection.execute(text("ALTER TABLE parts DROP COLUMN IF EXISTS imageUrl"))
            print("Migration successful.")
        except Exception as e:
            print(f"Migration note: {e}")
        
        connection.commit()

if __name__ == "__main__":
    migrate()
