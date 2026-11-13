<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function me()
    {
        return response()->json([
            'user' =>  request()->user()
        ]);
    }
}
