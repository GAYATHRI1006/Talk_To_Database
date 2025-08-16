import os
from dotenv import load_dotenv
import pymysql
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Load .env file
load_dotenv()

# Database and API keys from .env
MYSQL = {
    "host": os.getenv("MYSQL_HOST"),
    "user": os.getenv("MYSQL_USER"),
    "password": os.getenv("MYSQL_PASSWORD"),
    "database": os.getenv("MYSQL_DATABASE")
}
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()

# Allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str

def get_sql_from_openrouter(prompt: str) -> str:
    schema_hint = """users(id INT, name VARCHAR(100), email VARCHAR(100)); transactions(id INT, user_id INT, amount DECIMAL(10,2), status VARCHAR(50));"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = [
        {"role": "system", "content": f"You are an expert MySQL query generator. Given the table schema: {schema_hint}, output only the SQL code for the user prompt, no extra text."},
        {"role": "user", "content": prompt}
    ]
    data = {
        "model": "google/gemini-flash-1.5",
        "messages": messages
    }
    response = requests.post(url, json=data, headers=headers, timeout=30)
    sql = response.json()['choices'][0]['message']['content']
    # Strip markdown code fences if present
    sql = sql.strip("```sql\n").strip("```").strip()
    return sql

def is_sql_safe(sql: str) -> bool:
    # Only allow SELECT statements for safety
    return sql.strip().lower().startswith("select")

def run_sql(sql: str):
    if not is_sql_safe(sql):
        raise Exception("Only SELECT statements are allowed for safety.")
    conn = pymysql.connect(**MYSQL)
    with conn.cursor() as cursor:
        cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
    conn.close()
    return columns, rows

@app.post("/query")
def query_nl(request: QueryRequest):
    prompt = request.prompt
    try:
        sql = get_sql_from_openrouter(prompt)
        if not is_sql_safe(sql):
            return {
                "success": False,
                "error": "Only SELECT statements are allowed. For security, write queries are blocked."
            }
        columns, rows = run_sql(sql)
        return {
            "success": True,
            "prompt": prompt,
            "sql": sql,
            "columns": columns,
            "rows": rows
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }