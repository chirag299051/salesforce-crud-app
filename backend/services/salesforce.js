const axios = require("axios");

const SALESFORCE_LOGIN_URL =
  process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com";

async function exchangeCodeForToken(code, codeVerifier) {
  const params = new URLSearchParams();

  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", process.env.SALESFORCE_CLIENT_ID);
  params.append("client_secret", process.env.SALESFORCE_CLIENT_SECRET);
  params.append("redirect_uri", process.env.SALESFORCE_CALLBACK_URL);
  params.append("code_verifier", codeVerifier);

  const response = await axios.post(
    `${SALESFORCE_LOGIN_URL}/services/oauth2/token`,
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams();

  params.append("grant_type", "refresh_token");
  params.append("client_id", process.env.SALESFORCE_CLIENT_ID);
  params.append("client_secret", process.env.SALESFORCE_CLIENT_SECRET);
  params.append("refresh_token", refreshToken);

  const response = await axios.post(
    `${SALESFORCE_LOGIN_URL}/services/oauth2/token`,
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

module.exports = {
  exchangeCodeForToken,
  refreshAccessToken,
};
