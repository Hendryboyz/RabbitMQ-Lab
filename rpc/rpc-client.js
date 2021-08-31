import * as amqp from 'amqplib/callback_api.js';
import { v4 as uuidv4 } from 'uuid';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
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
            error;
        }
        channel.assertQueue('', { exclusive: true }, (assertError, q) => {
            if (assertError) {
                throw assertError;
            }
            const correlationId = uuidv4();
            const num = args[0];
            console.log(` [x] Requesting fib(${num})`);

            // invoke remote procedure call(RPC) function
            const queueName = 'rpc_queue';
            channel.sendToQueue(queueName, Buffer.from(num), {
                correlationId: correlationId,
                replyTo: q.queue,
            });

            // get the RPC result
            channel.consume(q.queue, (message) => {
                if (message.properties.correlationId !== correlationId) {
                    return;
                }
                console.log(` [x] Get fib(${num}) = ${message.content.toString()}`);
                // channel.ack(message);
                setTimeout(() => {
                    connection.close();
                    process.exit(0);
                }, 500);
            }, {
                noAck: true,
            });
        });
    });
};
