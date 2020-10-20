const schema = {
    properties: {
        queryStringParameters: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['OPEN', 'EXPIRED'],
                    default: 'OPEN',
                },
            },
        },
    },
    required: [
        'queryStringParameters',
    ]
};

export default schema;