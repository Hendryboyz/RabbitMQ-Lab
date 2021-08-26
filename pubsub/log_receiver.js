import * as amqp from 'amqplib/callback_api.js';

amqp.connect('amqp://user:bitnami@localhost', (error, conn) => {
    if (error) {
        throw error;
    }
    createChannel(conn);
});

const createChannel = (connection) => {
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        const exchangeName = 'logs';
        const exchangeType = 'fanout';
        channel.assertExchange(exchangeName, exchangeType, {
            durable: false,
        });

        channel.assertQueue('', {
            exclusive: true,
        }, (error, q) => { bindQueue(q, channel, exchangeName); });
    });
};

const bindQueue = (assert, channel, exchangeName) => {
    channel.bindQueue(assert.queue, exchangeName, '');
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", assert.queue);
    channel.consume(assert.queue, (message) => {
        if (message.content) {
            console.log(" [x] %s", message.content.toString());
        }
        channel.ack(message);
    }, {
        noAck: false
    });
};
