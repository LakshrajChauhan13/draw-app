import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";

const encodedJwtSecretKey = new TextEncoder().encode(JWT_SECRET_KEY)
    
async function isTokenValid(token: string): Promise<boolean> {
    try{
        await jwtVerify(token, encodedJwtSecretKey)
        return true;
    }catch(error){
        console.error("token invalid inside the proxy.ts", error)
        return false
    }
}

export async function proxy(request: NextRequest){
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname.startsWith('/signup') || pathname.startsWith('/signin');

    const validToken = token ? await isTokenValid(token) : false

    if(isProtectedRoute && !validToken){
        const loginUrl = new URL('/signin', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        const response = NextResponse.redirect(loginUrl);

        if(token){
            response.cookies.delete('accessToken');
            response.cookies.delete('wsToken');
        }
        
        return response;
    }
    
    if(isAuthRoute && validToken){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/canvas/:path*',
        '/signin',
        '/signup',
    ],
};