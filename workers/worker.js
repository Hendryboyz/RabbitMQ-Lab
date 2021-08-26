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
        let queueName = 'task_queue';
        
        channel.assertQueue(queueName, {
            durable: false,
        });
        channel.prefetch(1);

        console.log(`[*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
        channel.consume(queueName, (message) => consumeMessage(message, channel), {
            noAck: false
        });
    });
}

function consumeMessage(message, channel) {
    console.log(`[x] Received ${message.content.toString()}`);
    const secs = message.content.toString().split('.').length - 1;
    console.log(`This task has to take ${secs} secs`);
    setTimeout(() => {
        console.log('[x] done');
        channel.ack(message);
    }, secs * 1000);
}
