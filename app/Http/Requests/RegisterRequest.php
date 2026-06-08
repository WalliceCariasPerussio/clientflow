<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para registro de novo usuário.
 * Valida os dados de cadastro antes de atingir o controller.
 */
class RegisterRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer esta requisição.
     */
    public function authorize(): bool
    {
        return true; // Registro é público
    }

    /**
     * Regras de validação para o registro.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Mensagens de erro personalizadas em português.
     */
    public function messages(): array
    {
        return [
            'name.required'      => 'O nome é obrigatório.',
            'email.required'     => 'O email é obrigatório.',
            'email.email'        => 'Informe um email válido.',
            'email.unique'       => 'Este email já está em uso.',
            'password.required'  => 'A senha é obrigatória.',
            'password.min'       => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed' => 'A confirmação da senha não confere.',
        ];
    }
}
