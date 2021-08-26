import * as amqp from 'amqplib/callback_api.js';

amqp.connect('amqp://user:bitnami@localhost', (error, conn) => {
    if (error) {
        throw error;
    }
    createChannel(conn);
});

function createChannel(connection) {
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        let queueName = 'hello';
        
        channel.assertQueue(queueName, {
            durable: true,
        });

        console.log(`[*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
        channel.consume(queueName, consumeMessage, {
            noAck: true
        });
    });
}

function consumeMessage(message) {
    console.log(`[x] Received ${message.content.toString()}`);
}
