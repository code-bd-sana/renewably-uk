import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export default async function DashboardPage() {
  // Simple auth check 
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  // If no token, redirect to login
  if (!token) {
    redirect('/login');
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // User is authenticated, show dashboard
  } catch (error) {
    // Invalid token, redirect to login
    redirect('/login');
  }
  
  return (
    <div>Dashboard Content</div>
  );
}