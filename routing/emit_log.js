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

        const exchangeName = 'direct_logs';
        const exchangeType = 'direct';
        channel.assertExchange(exchangeName, exchangeType, {
            durable: false,
        });

        let args = process.argv.slice(2);
        let severity = args.length > 0 ? args[0] : 'info';
        let message = args.slice(1).join(' ') || 'Hello routing!';
        channel.publish(exchangeName, severity, Buffer.from(message));
        console.log(` [x] sent ${message}`);
    });
};