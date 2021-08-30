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

const createChannel = (connection) => {
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        const args = process.argv.slice(2);
        const key = args.length >= 2 ? args[0] : 'anonymous.info';
        const message = args.slice(1).join(' ') || 'hello topics';
        const exchangeName = 'topic-logs';

        channel.assertExchange(exchangeName, 'topic', {
            durable: false,
        });
        channel.publish(exchangeName, key, Buffer.from(message));
        console.log(` [x] Sent ${key}: ${message}`);
    });
};