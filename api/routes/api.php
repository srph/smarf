<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BoardsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\HeroesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('gm', fn () => \App\Models\User::all());

Route::get('auth/register', [AuthController::class, 'register']);
Route::Get('auth/me', [AuthController::class, 'me'])
Route::get('heroes', [HeroesController::class, 'index']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('board.own')->group(function () {
        Route::get('boards', [BoardsController::class, 'index']);
        Route::post('boards', [BoardsController::class, 'store']);
        Route::get('boards/{board}', [BoardsController::class, 'show']);
        Route::put('boards/{board}', [BoardsController::class, 'update']);
        Route::delete('boards/{board}', [BoardsController::class, 'destroy']);
    });

    Route::middleware('category.own')->group(function () {
        Route::post('categories', [CategoriesController::class, 'store']);
        Route::put('categories/{category}', [CategoriesController::class, 'update']);
        Route::delete('categories/{category}', [CategoriesController::class, 'destroy']);

        Route::post('categories/{category}/heroes', [HeroesController::class, 'insert']);
        Route::put('categories/{category}/heroes/{hero}', [HeroesController::class, 'reorder']);
        Route::delete('categories/{category}/heroes/{hero}', [HeroesController::class, 'remove']);
    });
});
