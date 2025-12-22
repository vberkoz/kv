export async function handler(event: any) {
  if (event.source === 'aws.events' && event['detail-type'] === 'Scheduled Event') {
    return { statusCode: 200, body: 'Warmed' };
  }
  return { statusCode: 200, body: 'OK' };
}
