<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller do Dashboard da API.
 *
 * Fornece estatísticas agregadas dos clientes do usuário autenticado.
 */
class DashboardController extends Controller
{
    /**
     * Retorna as estatísticas do dashboard para o usuário autenticado.
     *
     * Inclui:
     *  - total de clientes
     *  - clientes ativos
     *  - clientes inativos
     *  - leads
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Obtém as contagens em uma única query para performance
        $total    = Client::where('user_id', $userId)->count();
        $active   = Client::where('user_id', $userId)->where('status', 'active')->count();
        $inactive = Client::where('user_id', $userId)->where('status', 'inactive')->count();
        $leads    = Client::where('user_id', $userId)->where('status', 'lead')->count();

        return response()->json([
            'data' => [
                'total'    => $total,
                'active'   => $active,
                'inactive' => $inactive,
                'leads'    => $leads,
            ],
        ]);
    }
}
