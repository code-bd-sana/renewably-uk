import jwt from 'jsonwebtoken';

export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

export async function authenticate(request) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try cookies for browser requests
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = {};
      
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name.trim()] = decodeURIComponent(value.trim());
        }
      });
      
      token = cookies['auth_token'];
    }

    // console.log('Auth token found:', !!token);
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'Please login to access this resource',
        status: 401,
      };
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return {
        success: false,
        error: 'Invalid or expired token',
        message: 'Please login again',
        status: 401,
      };
    }

    // console.log('Decoded token:', decoded);
    
    // Return user info
    return {
      success: true,
      userId: decoded.userId,
      userEmail: decoded.email,
      userRole: decoded.role,
      userName: decoded.name || '',
      decoded,
    };
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500,
    };
  }
}

/**
 * Check if user is admin
 */
export function requireAdmin(userRole) {
  return userRole === 'admin';
}