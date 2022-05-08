<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Requests\AuthRegisterRequest;

class AuthController extends Controller
{
    public function register(AuthRegisterRequest $request)
    {
        User::create([
            'name' => $request->input('name'),
            'email' => $request->input('username'),
            'password' => bcrypt($request->input('password'))
        ]);

        return response()->json([
            'success' => true
        ]);
    }

    public function me()
    {
        return response()->json([
            'user' =>  request()->user()
        ]);
    }
}
