export async function POST() {
  try {
    // Create response with clear cookie header
    const response = new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Logged out successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        }
      }
    );
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Logout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

//Also handle GET requests for direct browser navigation
export async function GET() {
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Send POST request to logout' 
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}