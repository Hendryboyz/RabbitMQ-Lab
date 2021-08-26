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

        const exchangeName = 'logs';
        const exchangeType = 'fanout';
        channel.assertExchange(exchangeName, exchangeType, {
            durable: false,
        });

        let message = process.argv.slice(2).join(' ') || 'Hello pubsub model';
        channel.publish(exchangeName, '', Buffer.from(message));
        console.log(` [x] sent ${message}`);
    });
}
