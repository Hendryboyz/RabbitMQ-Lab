import * as amqp from 'amqplib/callback_api.js';

amqp.connect('amqp://user:bitnami@localhost', (error, conn) => {
    if (error) {
        throw error;
    }
    createChannel(conn);
    setTimeout(() => {
        conn.close();
        process.exit(0);
    }, 500);
});

function createChannel(connection) {
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        let queueName = 'task_queue';
        let message = process.argv.slice(2).join(' ') || 'Hello World';
        
        channel.assertQueue(queueName, {
            durable: false,
        });
        channel.sendToQueue(queueName, Buffer.from(message), {
            persistent: true
        });
        console.log(`[x] Sent ${message}`);
    });
}