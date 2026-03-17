import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SG Tech Solution API"
    DATABASE_URL: str = "postgresql://neondb_owner:npg_QyTFvSq8W3rs@ep-falling-leaf-am1fn268-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "defaultSecret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()
