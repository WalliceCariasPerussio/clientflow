<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\CompanyController;
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
    Route::put('/profile', [AuthController::class, 'profile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Clientes — CRUD completo + extras
    Route::get('/clients/export', [ClientController::class, 'export']);
    Route::get('/clients/recent', [ClientController::class, 'recent']);
    Route::apiResource('/clients', ClientController::class);

    // Empresas
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::post('/companies', [CompanyController::class, 'store']);

    // Vendas — CRUD + stats
    Route::get('/sales/monthly', [SaleController::class, 'monthly']);
    Route::get('/sales/totals', [SaleController::class, 'totals']);
    Route::apiResource('/sales', SaleController::class);

    // Financeiro
    Route::get('/transactions/balance', [TransactionController::class, 'balance']);
    Route::apiResource('/transactions', TransactionController::class);

    // Agenda
    Route::apiResource('/appointments', AppointmentController::class);
});
