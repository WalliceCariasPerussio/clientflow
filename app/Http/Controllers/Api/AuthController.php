<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controller de Autenticação via API (Sanctum).
 *
 * Gerencia registro, login, logout e recuperação do usuário autenticado.
 * Utiliza tokens do Laravel Sanctum para autenticação stateless.
 */
class AuthController extends Controller
{
    /**
     * Registra um novo usuário e retorna o token de acesso.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Cria o usuário com os dados validados
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Cria um token Sanctum com abilities básicas
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Usuário registrado com sucesso.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Autentica o usuário com email e senha.
     * Retorna o token Sanctum em caso de sucesso.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Busca o usuário pelo email
        $user = User::where('email', $request->email)->first();

        // Verifica credenciais
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas.',
            ], 401);
        }

        // Cria um novo token (revoga tokens anteriores opcionalmente)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    /**
     * Revoga todos os tokens do usuário autenticado (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoga o token atual usado na requisição
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    /**
     * Retorna os dados do usuário autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }
}
