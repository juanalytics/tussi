import os
from pymongo import MongoClient

READ_DB_URL = os.getenv("READ_DB_URL", "mongodb://localhost:27018")
READ_DB_NAME = os.getenv("READ_DB_NAME", "products_read_db")

class ReadDB:
    def __init__(self):
        self.client = MongoClient(READ_DB_URL)
        self.db = self.client[READ_DB_NAME]
        self.products = self.db.products

    def close(self):
        self.client.close()

read_db_client = ReadDB()

def get_read_db():
    return read_db_client 