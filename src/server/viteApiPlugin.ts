import type { Plugin, ViteDevServer } from 'vite';
import {
  sendAuthConfirmationEmail,
  sendCustomerSatisfactionSurveyEmail,
  sendLoginNotificationEmail,
  getEmailDispatchHistory,
} from './emailService';

export function viteApiPlugin(): Plugin {
  return {
    name: 'sheq-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Only handle /api endpoints
        if (!url.startsWith('/api/')) {
          return next();
        }

        // Helper to read JSON request body
        const readBody = async (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', reject);
          });
        };

        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        try {
          if (req.method === 'POST' && url === '/api/send-auth-link') {
            const body = await readBody();
            const { email, confirmationLink, otpCode, companyName } = body;

            if (!email) {
              return sendJson(400, { success: false, error: 'Email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const finalLink =
              confirmationLink ||
              `${origin}/#magic_token=${Math.random().toString(36).substring(2)}&email=${encodeURIComponent(
                email
              )}`;

            const result = await sendAuthConfirmationEmail({
              email,
              confirmationLink: finalLink,
              otpCode,
              companyName,
            });

            return sendJson(200, {
              success: true,
              message: `Sign-in confirmation link successfully sent to ${email}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              confirmationLink: finalLink,
            });
          }

          if (req.method === 'POST' && url === '/api/send-survey-link') {
            const body = await readBody();
            const { customerName, customerEmail, surveyUrl, companyName } = body;

            if (!customerEmail) {
              return sendJson(400, { success: false, error: 'Customer email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const finalUrl =
              surveyUrl ||
              `${origin}/#survey=nk-cs-${Math.random().toString(36).substring(2, 7)}`;

            const result = await sendCustomerSatisfactionSurveyEmail({
              customerName: customerName || 'Valued Customer',
              customerEmail,
              surveyUrl: finalUrl,
              companyName: companyName || 'nk',
            });

            return sendJson(200, {
              success: true,
              message: `Customer survey email successfully sent to ${customerEmail}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              surveyUrl: finalUrl,
            });
          }

          if (req.method === 'POST' && url === '/api/send-login-notification') {
            const body = await readBody();
            const { email, name, companyName, deviceInfo, ipAddress } = body;

            if (!email) {
              return sendJson(400, { success: false, error: 'Email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const clientIp =
              ipAddress ||
              (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
              req.socket.remoteAddress ||
              '127.0.0.1';
            const clientDevice =
              deviceInfo || (req.headers['user-agent'] as string) || 'Web Browser';

            const result = await sendLoginNotificationEmail({
              email,
              name: name || 'User',
              companyName: companyName || 'NK Quality Systems',
              deviceInfo: clientDevice,
              ipAddress: clientIp,
              workspaceUrl: origin,
            });

            return sendJson(200, {
              success: true,
              message: `Sign-in notification email successfully sent to ${email}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              timestamp: result.timestamp,
            });
          }

          if (req.method === 'GET' && url === '/api/email-dispatches') {
            const history = getEmailDispatchHistory();
            return sendJson(200, {
              success: true,
              dispatches: history,
            });
          }

          return next();
        } catch (error: any) {
          console.error('[API ERROR]', error);
          return sendJson(500, {
            success: false,
            error: error?.message || 'Internal server error while dispatching email',
          });
        }
      });
    },
  };
}
