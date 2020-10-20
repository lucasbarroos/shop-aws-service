import createError from 'http-errors';
import { getEndedProducts } from '../lib/getEndedProducts';
import { closeProduct } from '../lib/closeProducts';

async function processProducts(event, context) {
    try {
        const productsToClose = await getEndedProducts();
        const closePromises = productsToClose.map((product) => (closeProduct(product)));
        await Promise.all(closePromises);
        return { closed: closePromises.length };
    } catch(error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler = processProducts;