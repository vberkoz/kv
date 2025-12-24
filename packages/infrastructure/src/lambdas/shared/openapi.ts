import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { namespaceSchema, keySchema, valueSchema } from './validation';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Register security schemes
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});

registry.registerComponent('securitySchemes', 'apiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key'
});

// Auth schemas
const signupSchema = registry.register('Signup', z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).openapi({ example: 'password123' })
}));

const loginSchema = registry.register('Login', z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().openapi({ example: 'password123' })
}));

// Namespace schemas
const createNamespaceRequestSchema = registry.register('CreateNamespaceRequest', z.object({
  name: namespaceSchema.openapi({ example: 'myapp' })
}));

// KV schemas
const putValueRequestSchema = registry.register('PutValueRequest', z.object({
  value: z.any().openapi({ example: { name: 'John', email: 'john@example.com' } })
}));

// Register paths
registry.registerPath({
  method: 'post',
  path: '/v1/auth/signup',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: {
    200: { description: 'User created successfully' },
    400: { description: 'Invalid input' }
  }
});

registry.registerPath({
  method: 'post',
  path: '/v1/auth/login',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: { description: 'Login successful' },
    401: { description: 'Invalid credentials' }
  }
});

registry.registerPath({
  method: 'post',
  path: '/v1/namespaces',
  tags: ['Namespaces'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createNamespaceRequestSchema } } } },
  responses: {
    201: { description: 'Namespace created' },
    400: { description: 'Invalid input' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/namespaces',
  tags: ['Namespaces'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'List of namespaces' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/{namespace}/{key}',
  tags: ['KV Operations'],
  security: [{ apiKey: [] }],
  request: {
    params: z.object({
      namespace: namespaceSchema.openapi({ example: 'myapp' }),
      key: keySchema.openapi({ example: 'user:123' })
    })
  },
  responses: {
    200: { description: 'Value retrieved' },
    404: { description: 'Key not found' }
  }
});

registry.registerPath({
  method: 'put',
  path: '/v1/{namespace}/{key}',
  tags: ['KV Operations'],
  security: [{ apiKey: [] }],
  request: {
    params: z.object({
      namespace: namespaceSchema.openapi({ example: 'myapp' }),
      key: keySchema.openapi({ example: 'user:123' })
    }),
    body: { content: { 'application/json': { schema: putValueRequestSchema } } }
  },
  responses: {
    200: { description: 'Value stored' },
    400: { description: 'Invalid input' }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/v1/{namespace}/{key}',
  tags: ['KV Operations'],
  security: [{ apiKey: [] }],
  request: {
    params: z.object({
      namespace: namespaceSchema.openapi({ example: 'myapp' }),
      key: keySchema.openapi({ example: 'user:123' })
    })
  },
  responses: {
    200: { description: 'Value deleted' },
    404: { description: 'Key not found' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/{namespace}',
  tags: ['KV Operations'],
  security: [{ apiKey: [] }],
  request: {
    params: z.object({
      namespace: namespaceSchema.openapi({ example: 'myapp' })
    }),
    query: z.object({
      prefix: z.string().optional().openapi({ example: 'user:' })
    })
  },
  responses: {
    200: { description: 'List of keys' }
  }
});

export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'KV Storage API',
      version: '1.0.0',
      description: 'Serverless key-value storage API powered by AWS DynamoDB'
    },
    servers: [
      { url: 'https://api.kv.vberkoz.com', description: 'Production' }
    ],
    security: [
      { bearerAuth: [] },
      { apiKey: [] }
    ]
  });
}
