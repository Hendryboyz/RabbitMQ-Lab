import * as amqp from 'amqplib/callback_api.js';

let args = process.argv.slice(2);
if (args.length === 0){
    console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
    process.exit(1);
}

amqp.connect('amqp://user:bitnami@localhost', (error, conn) => {
    if (error) {
        throw error;
    }
    createConnection(conn);
});


const createConnection = (connection) => {
    connection.createChannel((error, channel) => {
        const exchangeName = 'direct_logs';
        const exchangeType = 'direct';
        channel.assertExchange(exchangeName, exchangeType, {
            durable: false,
        });
        channel.assertQueue('', { exclusive: true, }, (error, q) => {
            let severities = args;
            severities.forEach((severity) => {
                channel.bindQueue(q.queue, exchangeName, severity);
            });
            console.log(' [*] Waiting for logs. To exit press CTRL+C');
            channel.consume(q.queue, (msg) => messageConsume(msg, channel), {
                noAck: false,
            });
        });
    });
};

const messageConsume = (message, channel) => {
    console.log(` [x] ${message.fields.routingKey}: ${message.content.toString()}`);
    channel.ack(message);
};
