import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeProduct(product) {
    const params = {
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Key: { id: product.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED',            
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    await dynamodb.update(params).promise();
    const { title, seller, highestBid } = product;
    const { amount } = highestBid;
    if (highestBid.bidder) {
        const notifySeller = sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject : 'Your item has been sold!',
                recipient: seller,
                body: `Woohoo! Yout item "${title}" has been sold for R$${amount}.`,
            }),
        }).promise();

        const notifyBidder = sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject : 'You won an product!',
                recipient: bidder,
                body: `What a great deal! You got yourselft a "${title}" for R$${amount}`,
            }),
        }).promise();

        return Promise.all([notifySeller, notifyBidder]);
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject : 'Oh no! Your item hasnt been sold!',
            recipient: seller,
            body: `Sorry! No on wants yout "${title}"`,
        }),
    }).promise();

    return Promise.all(notifySeller);
}

