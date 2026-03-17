from app.db.session import engine
from sqlalchemy import text

def fix():
    with engine.connect() as connection:
        try:
            # Case-sensitive columns in PostgreSQL need double quotes
            connection.execute(text('ALTER TABLE parts ADD COLUMN IF NOT EXISTS "imageUrls" JSONB DEFAULT \'[]\''))
            connection.execute(text('ALTER TABLE parts ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT \'{}\''))
            
            # Migrate existing imageUrl to imageUrls list if needed
            try:
                connection.execute(text('''
                    UPDATE parts 
                    SET "imageUrls" = jsonb_build_array("imageUrl") 
                    WHERE "imageUrl" IS NOT NULL AND ("imageUrls" IS NULL OR "imageUrls" = '[]'::jsonb)
                '''))
            except Exception as inner_e:
                print(f"Data migration note: {inner_e}")

            # Drop old unquoted ones if they were accidentally created
            connection.execute(text('ALTER TABLE parts DROP COLUMN IF EXISTS imageurls'))
            # Drop old "imageUrl" column
            connection.execute(text('ALTER TABLE parts DROP COLUMN IF EXISTS "imageUrl"'))
            
            print("Database schema fixed successfully.")
        except Exception as e:
            print(f"Schema fix error: {e}")
        
        connection.commit()

if __name__ == "__main__":
    fix()
