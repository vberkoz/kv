import { APIResponse } from '@kv/shared';

export function successResponse(data: any, statusCode = 200): APIResponse {
  return {
    statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
}

export function errorResponse(error: string, statusCode = 400): APIResponse {
  return {
    statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error, statusCode })
  };
}
