import * as amqp from 'amqplib/callback_api.js';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: receive_logs_topic.js <facility>.<severity>');
    process.exit(1);
}

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
        const exchangeName = 'topic-logs';
        channel.assertExchange(exchangeName, 'topic', {
            durable: false,
        });

        console.log(' [*] Waiting for logs. To exit press CTRL+C');

        channel.assertQueue('', {
            exclusive: true,
        }, (assertError, q) => {
            if (assertError) {
                throw assertError;
            }
            args.forEach((topic) => {
                console.log(`bind queue(${q.queue}) with key(${topic})`)
                channel.bindQueue(q.queue, exchangeName, topic);
            });

            channel.consume(q.queue, (message) => {
                console.log(` [x] ${message.fields.routingKey}: ${message.content.toString()}`);
            }, { noAck: true });
        });
    });
};