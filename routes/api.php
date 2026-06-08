<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ClientFlow
|--------------------------------------------------------------------------
|
| Rotas da API REST para o portfólio ClientFlow.
| Autenticação via Laravel Sanctum (token-based).
|
*/

// Rotas públicas (sem autenticação)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas (requerem token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Clientes — CRUD completo
    Route::apiResource('/clients', ClientController::class);
});
