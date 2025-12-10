import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

export async function sendUsageAlert(email: string, percent: number, plan: string) {
  try {
    await ses.send(new SendEmailCommand({
      Source: 'noreply@kv.vberkoz.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: `Usage Alert: ${percent}% of your plan limit` },
        Body: {
          Text: { 
            Data: `You've used ${percent}% of your monthly quota on the ${plan} plan.\n\nConsider upgrading your plan to avoid service interruption.\n\nVisit https://kv.vberkoz.com/pricing to upgrade.` 
          }
        }
      }
    }));
  } catch (error) {
    console.error('Failed to send usage alert:', error);
  }
}
