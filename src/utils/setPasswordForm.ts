export const formWithPassword = (token: string, businessId: string) => {
  return `
    <h2>Set Your Password</h2>
    <form method="POST" action="/api/userActivation">
     <input type="hidden" name="businessId" value="${businessId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="password" name="password" placeholder="Password" required />
    <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
    <button type="submit">Set Password</button>
    </form>
  `;
};

export const formWithoutPassword = (userId: string, businessId: string) => {
  return `
    <h2>Activate Your Account with new business</h2>
    <form method="POST" action="/api/userActivation">
     <input type="hidden" name="businessId" value="${businessId}" />
     <input type="hidden" name="userId" value="${userId}" />
    <button type="submit">Activate</button>
    </form>
  `;
};

export const formForgetPassword = (token: string) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Set New Password | Nodal POS</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;">

      <div style="width: 100%; max-width: 400px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); margin: auto;">

          <!-- Header -->
          <div style="margin-bottom: 24px; text-align: center;">
              <div style="font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 6px;">Nodal POS.</div>
              <h1 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">Activate Your Account with new business</h1>
              <p style="font-size: 13px; color: #64748b; margin: 0;">Please enter your new password below.</p>
          </div>

          <!-- Form -->
          <form method="POST" action="/api/auth/reset-password">

              <input type="hidden" name="token" value="${token}" />



              <div style="margin-bottom: 16px;">
                  <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">New Password</label>
                  <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                      minlength="6"
                      style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #0f172a; box-sizing: border-box; outline: none;"
                  />
              </div>

              <div style="margin-bottom: 20px;">
                  <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Confirm Password</label>
                  <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                      minlength="6"
                      style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #0f172a; box-sizing: border-box; outline: none;"
                  />
              </div>

              <button
                  type="submit"
                  style="width: 100%; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 12px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px;"
              >
                  Set password
              </button>
          </form>

          <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
              Secure multi-tenant retail authentication system.
          </div>
      </div>

  </body>
  </html>
  `;
};

export const passwordResetLink = (resetPasswordUrl: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; margin: 0; }
    .card { max-width: 480px; margin: 20px auto; background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin-top:0; color: #0f172a;">Reset Password</h2>
    <p>Here is your password reset link. You can use this link only for <strong>15 minutes</strong>.</p>
    <div>
      <a href="${resetPasswordUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #64748b; word-break: break-all;">
      Or copy and paste this link into your browser:<br/>
      <a href="${resetPasswordUrl}" style="color: #2563eb;">${resetPasswordUrl}</a>
    </p>
  </div>
</body>
</html>`;
};
