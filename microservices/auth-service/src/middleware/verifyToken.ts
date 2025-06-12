import { Request, Response, NextFunction } from "express";
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

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  // Verificăm token-ul
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
        res.status(401).json({ message: "Token invalid" });
        return;
      }

      const userId = decoded?.sub; // Extragerea user ID-ului din token
      if (!userId || typeof userId !== "string") {
        res
          .status(400)
          .json({ message: "User ID missing or invalid in token" });
        return;
      }

      try {
        // Obținem un token pentru Management API
        const managementAccessToken = await getManagementApiToken();
        const userInfo = await getUserInfo(userId, managementAccessToken);

        // Adăugăm email-ul și user ID-ul în req.user
        req.user = {
          email: userInfo.email,
          userId: userInfo.user_id,
        };

        next(); // Continuăm la următoarea fază
      } catch (apiErr) {
        res
          .status(500)
          .json({ message: "Failed to fetch user data", error: apiErr });
      }
    }
  );
};
