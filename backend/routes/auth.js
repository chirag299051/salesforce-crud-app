const express = require("express");
const crypto = require("crypto");
const { exchangeCodeForToken } = require("../services/salesforce");

const router = express.Router();

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(codeVerifier) {
  return base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );
}

router.get("/login", (req, res) => {
  try {
    const state = base64UrlEncode(crypto.randomBytes(32));
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.SALESFORCE_CLIENT_ID,
      redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authorizationUrl = `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;

    // console.log("OAuth redirect URI:", process.env.SALESFORCE_CALLBACK_URL);
    // console.log("OAuth authorization URL:", authorizationUrl);

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("OAuth login error:", error);

    res.status(500).json({
      error: "Unable to start Salesforce OAuth login",
      details: error.message,
    });
  }
});

router.get("/callback", async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.status(400).json({
        error,
        error_description,
      });
    }

    if (!code) {
      return res.status(400).json({
        error: "Missing authorization code",
      });
    }

    if (!state || state !== req.session.oauthState) {
      return res.status(400).json({
        error: "Invalid OAuth state",
      });
    }

    if (!req.session.codeVerifier) {
      return res.status(400).json({
        error: "Missing PKCE code verifier",
      });
    }

    const tokenData = await exchangeCodeForToken(
      code,
      req.session.codeVerifier,
    );

    req.session.salesforce = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      instanceUrl: tokenData.instance_url,
      issuedAt: tokenData.issued_at,
      signature: tokenData.signature,
      id: tokenData.id,
    };

    delete req.session.oauthState;
    delete req.session.codeVerifier;

    res.json({
      success: true,
      message: "Salesforce authentication successful",
      instanceUrl: tokenData.instance_url,
    });
  } catch (error) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message,
    );

    res.status(500).json({
      error: "Salesforce OAuth authentication failed",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.salesforce) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    instanceUrl: req.session.salesforce.instanceUrl,
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: "Unable to logout",
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

module.exports = router;
