import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getProductById(id) {
    let product;

    try {
        const result = await dynamodb.get({ 
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Key: { id },
         }).promise();
        product = result.Item;
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if(!product) {
        throw new createError.NotFound(`Product with ID "${id}" not found!`);
    }

    return product;
};

async function getProduct(event, context) {    
    const { id } = event.pathParameters;

    const product = await getProductById(id);


    return {
        statusCode: 201,
        body: JSON.stringify(product),
    };
}

export const handler = commonMiddleware(getProduct);



