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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/', [BoardsController::class, 'index']);
    Route::post('/', [BoardsController::class, 'store']);
    Route::get('{board}', [BoardsController::class, 'show']);
    Route::put('{board}', [BoardsController::class, 'update']);
    Route::delete('{board}', [BoardsController::class, 'destroy']);

    Route::post('categories', [CategoriesController::class, 'store']);
    Route::put('categories/{category}', [CategoriesController::class, 'update']);
    Route::delete('categories/{category}', [CategoriesController::class, 'destroy']);

    Route::post('categories/{category}/heroes', [HeroesController::class, 'store']);
    Route::put('categories/{category}/heroes/{hero}', [HeroesController::class, 'update']);
    Route::delete('categories/{category}/heroes/{hero}', [HeroesController::class, 'destroy']);
});