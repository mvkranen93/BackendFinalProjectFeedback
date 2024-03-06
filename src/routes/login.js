// Middleware to handle JWT authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    // Extract the token without the "Bearer " prefix
    const tokenWithoutBearer = token.replace(/^Bearer\s/, '');
  
    jwt.verify(tokenWithoutBearer, '39393jfjdKER74hjrejw934', (err, user) => {
      if (err) {
        console.error('Authentication Error:', err);  // Log the error for debugging
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      // Check if the token has expired
      const decodedToken = jwt.decode(tokenWithoutBearer, { complete: true });
  
      if (decodedToken && decodedToken.payload.exp) {
        const expirationTime = new Date(decodedToken.payload.exp * 1000);
        const currentTime = new Date();
  
        if (expirationTime <= currentTime) {
          return res.status(401).json({ error: 'Token has expired' });
        }
      }
  
      console.log('Decoded User:', user);  // Log the decoded user for debugging
  
      req.user = user;
      next();
    });
  }

  export default authenticateToken