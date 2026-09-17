import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(); // Client ID will be passed directly in the verification method or setup via env

export const verifyGoogleToken = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    }

    // Usually, you would issue a JWT here to maintain session, but for simplicity we can return the user info
    // For a production app, generating a custom JWT is recommended.
    res.status(200).json({ user, token: credential }); // Using google token as a rudimentary session for this example
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
