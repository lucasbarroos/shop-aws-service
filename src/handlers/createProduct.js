import { v4 as uuid }  from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import createProductsSchema from '../lib/schemas/createProductsSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createProduct(event, context) {
  const { title, price, state, category, description } = event.body;
  const { email } = event.requestContext.authorizer; // Catch the seller by token
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(now.getMonth() + 2);

  const product = {
    id: uuid(),
    title,
    price,
    state,
    category,
    description,
    seller: email,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(), // Deadline to expire the product
  };
  try {
    await dynamodb.put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: product,    
    }).promise();
  } catch(error) {
    console.log(error);
     throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(product),
  };
}

export const handler = commonMiddleware(createProduct)
.use(validator({ inputSchema: createProductsSchema }));
