import * as amqp from 'amqplib/callback_api.js';

amqp.connect('amqp://user:bitnami@localhost', (error, conn) => {
    if (error) {
        throw error;
    }
    createChannel(conn);
    setTimeout(() => {
        conn.close();
        process.exit(0);
    }, 1000);
});

function createChannel(connection) {
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        let queueName = 'hello';
        let message = 'hello world';
        
        channel.assertQueue(queueName, {
            durable: true,
        });
        channel.sendToQueue(queueName, Buffer.from(message));
        console.log(`[x] Sent ${message}`);
    });
}