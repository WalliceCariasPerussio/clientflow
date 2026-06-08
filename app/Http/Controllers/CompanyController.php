<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Empresas da API.
 *
 * CRUD para gestão de empresas do usuário autenticado.
 */
class CompanyController extends Controller
{
    /**
     * Lista as empresas do usuário (para dropdowns).
     */
    public function index(Request $request): JsonResponse
    {
        $companies = Company::where('user_id', $request->user()->id)
            ->when($request->q, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['data' => $companies]);
    }

    /**
     * Cria uma nova empresa.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        // Verifica duplicata
        $exists = Company::where('user_id', $request->user()->id)
            ->where('name', $validated['name'])
            ->first();

        if ($exists) {
            return response()->json(['data' => $exists], 200);
        }

        $company = Company::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $company], 201);
    }
}
