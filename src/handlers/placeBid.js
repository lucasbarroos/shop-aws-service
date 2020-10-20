import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import { getProductById } from './getProduct';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;

    const product = await getProductById(id);

    if (amount < product.highestBid.amount) {
        throw new createError.Forbidden(`Your bid must be higher than ${product.highestBid.amount}`);
    }

    if (product.status !== 'OPEN') {
        throw new createError.Forbidden('Your cannout bid on closed products');
    }

    const params = {
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email,
        },
        ReturnValues: 'ALL_NEW',
    };

    let updatedProduct;

    try {
        const result = await dynamodb.update(params).promise();
        updatedProduct = result.Attributes;
    } catch(error) {
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: JSON.stringify(updatedProduct),
    };
}

export const handler = commonMiddleware(placeBid)
.use(validator({ inputSchema: placeBidSchema }));
