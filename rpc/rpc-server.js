import * as amqp from 'amqplib/callback_api.js';

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
        // rpc_queue is the queue to receive requests
        const queueName = 'rpc_queue';
        channel.assertQueue(queueName, {
            durable: false,
        });
        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests');
        channel.consume(queueName, (message) => {
            const n = parseInt(message.content.toString());
            console.log(` [.] Request to calculate fib(${n})`);

            let result = fibonacci(n);
            
            channel.sendToQueue(message.properties.replyTo, Buffer.from(result.toString()), {
                correlationId: message.properties.correlationId
            });
            channel.ack(message);
        });
    });
}

const fibonacci = (n) => {
    if (isNaN(n)) {
        return 0;
    }
    if (n === 0 || n === 1) {
        return n;
    }
    let seq = [0, 1];
    for (let i = 2; i <= n; i++) {
        seq.push(seq[0] + seq[1]);
        seq.shift();
    }
    return seq[1];
}