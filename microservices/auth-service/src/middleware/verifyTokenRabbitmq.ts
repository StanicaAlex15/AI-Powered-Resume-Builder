import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

async function getManagementApiToken() {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    }
  );
  return response.data.access_token;
}

async function getUserInfo(userId: string, accessToken: string) {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export const verifyTokenFromString = async (token: string): Promise<any> => {
  return new Promise((resolve) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      },
      async (err, decoded) => {
        if (err) {
          return resolve({ valid: false, error: err.message });
        }

        const userId = decoded?.sub;
        if (!userId || typeof userId !== "string") {
          return resolve({ valid: false, error: "Invalid userId in token" });
        }

        try {
          const managementAccessToken = await getManagementApiToken();
          const userInfo = await getUserInfo(userId, managementAccessToken);

          return resolve({
            valid: true,
            email: userInfo.email,
            userId: userInfo.user_id,
          });
        } catch (error) {
          return resolve({
            valid: false,
            error: "Failed to fetch user info",
          });
        }
      }
    );
  });
};
