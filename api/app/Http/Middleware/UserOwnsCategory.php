<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserOwnsCategory
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $category = $request->route('category');

        if (!$request->user()->ownsBoard($category->board)) {
            return response()->json([
                'error' => true,
                'status' => 403,
                'message' => 'It appears that you don\'t have sufficient permissions to access this content.'
            ], 403);
        }

        return $next($request);
    }
}
