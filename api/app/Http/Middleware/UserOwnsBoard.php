<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserOwnsBoard
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
        $board = $request->route('board');

        if (!$request->user()->ownsBoard($board)) {
            return response()->json([
                'error' => true,
                'status' => 403,
                'message' => 'It appears that you don\'t have sufficient permissions to access this content.'
            ], 403);
        }

        return $next($request);
    }
}
