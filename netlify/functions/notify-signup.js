exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Email configuration missing" })
    };
  }

  let data;

  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" })
    };
  }

  if (data.registrationConfirmed !== true) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Registration not confirmed" })
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "KEGAFILMS <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: "New KEGAFILMS registration",
        text: "A new user has completed registration on KEGAFILMS."
      })
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Email sending failed" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Email service unavailable" })
    };
  }
};
