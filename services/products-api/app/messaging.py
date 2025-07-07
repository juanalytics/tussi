import os
import pika
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
EXCHANGE_NAME = "product_events"

class RabbitMQ:
    def __init__(self, url):
        self._url = url
        self._connection = None
        self._channel = None

    def connect(self):
        if self._connection and self._connection.is_open:
            return
        try:
            self._connection = pika.BlockingConnection(pika.URLParameters(self._url))
            self._channel = self._connection.channel()
            self._channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='fanout', durable=True)
            logger.info("Connected to RabbitMQ and declared exchange.")
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            self._connection = None
            self._channel = None

    def publish_event(self, event_data):
        self.connect() # Ensure connection is active
        if self._channel:
            try:
                message = json.dumps(event_data, default=str)
                self._channel.basic_publish(
                    exchange=EXCHANGE_NAME,
                    routing_key='',  # routing_key is ignored for fanout exchanges
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # make message persistent
                    ))
                logger.info(f"Published event: {event_data.get('event_type')}")
            except Exception as e:
                logger.error(f"Failed to publish event: {e}")
        else:
            logger.error("Cannot publish event, no RabbitMQ channel available.")

    def close(self):
        if self._connection and self._connection.is_open:
            self._connection.close()
            logger.info("RabbitMQ connection closed.")

rabbitmq_client = RabbitMQ(RABBITMQ_URL)

def get_rabbitmq():
    return rabbitmq_client 