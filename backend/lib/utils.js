// import jwt from 'jsonwebtoken';

// export const generateToken = (userId) => {
//     return jwt.sign({userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
// }


// backend/lib/utils.js

import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
