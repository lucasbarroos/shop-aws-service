import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import gteProductsSchema from '../lib/schemas/getProductsSchemas';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getProducts(event, context) {
    const { status } = event.queryStringParameters;
    let products = [];

    const params = {
        TableName: process.env.PRODUCTS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': status,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    try {
        const result = await dynamodb.query(params).promise();
        products = result.Items;
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: JSON.stringify(products),
    };
}

export const handler = commonMiddleware(getProducts)
.use(validator({ inputSchema: gteProductsSchema, useDefaults: true }));



