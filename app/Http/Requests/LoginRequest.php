<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para login de usuário.
 * Valida as credenciais antes de atingir o controller.
 */
class LoginRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     */
    public function authorize(): bool
    {
        return true; // Login é público
    }

    /**
     * Regras de validação para o login.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Mensagens de erro personalizadas em português.
     */
    public function messages(): array
    {
        return [
            'email.required'    => 'O email é obrigatório.',
            'email.email'       => 'Informe um email válido.',
            'password.required' => 'A senha é obrigatória.',
        ];
    }
}
