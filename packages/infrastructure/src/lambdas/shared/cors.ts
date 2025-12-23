const ALLOWED_ORIGINS = [
  'https://kv.vberkoz.com',
  'https://dashboard.kv.vberkoz.com'
];

export function validateOrigin(origin?: string): string {
  if (!origin) return ALLOWED_ORIGINS[0];
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export function getCorsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': validateOrigin(origin),
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}
