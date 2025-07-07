import pika
import json
import logging
import time
import os
from app.db.read_db import get_read_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
EXCHANGE_NAME = "product_events"

class ProductProjector:
    def __init__(self, rabbitmq_url, exchange_name):
        self.read_db = get_read_db()
        self.rabbitmq_url = rabbitmq_url
        self.exchange_name = exchange_name
        self._connection = None
        self._channel = None

    def _process_event(self, ch, method, properties, body):
        try:
            event = json.loads(body)
            event_type = event.get("event_type")
            product_id = event.get("product_id")
            event_data = event.get("event_data", {})
            logger.info(f"Processing event: {event_type} for product_id: {product_id}")

            if event_type == "ProductCreated":
                product_doc = {"id": product_id, **event_data}
                self.read_db.products.insert_one(product_doc)
                logger.info(f"Projector: Created product {product_id}")

            elif event_type == "ProductUpdated":
                self.read_db.products.update_one(
                    {"id": product_id},
                    {"$set": event_data}
                )
                logger.info(f"Projector: Updated product {product_id}")

            elif event_type == "ProductDeleted":
                self.read_db.products.delete_one({"id": product_id})
                logger.info(f"Projector: Deleted product {product_id}")

            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"Error processing event: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start_consuming(self):
        while True:
            try:
                self._connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
                self._channel = self._connection.channel()
                self._channel.exchange_declare(exchange=self.exchange_name, exchange_type='fanout', durable=True)
                
                result = self._channel.queue_declare(queue='', exclusive=True, durable=True)
                queue_name = result.method.queue
                
                self._channel.queue_bind(exchange=self.exchange_name, queue=queue_name)
                
                logger.info("Projector is waiting for events.")
                self._channel.basic_consume(queue=queue_name, on_message_callback=self._process_event)
                self._channel.start_consuming()

            except pika.exceptions.AMQPConnectionError as e:
                logger.error(f"Projector connection failed: {e}. Retrying in 5 seconds...")
                time.sleep(5)
            except Exception as e:
                logger.error(f"An unexpected error occurred in projector: {e}. Restarting consumption...")
                if self._connection and self._connection.is_open:
                    self._connection.close()
                time.sleep(5)

def run_projector():
    projector = ProductProjector(RABBITMQ_URL, EXCHANGE_NAME)
    projector.start_consuming() 