export const businessActivationForm = (token: string, userId: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Activate Business</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }
          .card {
            max-width: 400px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 6px;
          }
          button {
            margin-right: 10px;
            padding: 8px 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Activate Business</h2>
          <p>
            The business owner has requested activation.
            Do you want to proceed?
          </p>

          <form method="POST" action="/api/business/activation/${userId}/${token}">
            <button type="submit">Activate</button>
            <button type="button" onclick="window.location.href='/'">
              Cancel
            </button>
          </form>
        </div>
      </body>
    </html>
  `;
};

export const activationSuccess = () => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Account Activated 🎉</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }
          .card {
            max-width: 400px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Account Activated 🎉</h2>
          <p>Your password has been set successfully.</p>
          <a href="/api/auth/login">Go to Login</a>
        </div>
      </body>
    </html>
  `;
};
