<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * FormRequest para criação de cliente.
 * Valida os dados antes da persistência.
 */
class StoreClientRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a criar um cliente.
     */
    public function authorize(): bool
    {
        return true; // Qualquer usuário autenticado pode criar clientes
    }

    /**
     * Regras de validação para criação de cliente.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'string', 'email', 'max:255', 'unique:clients'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:255'],
            'status'  => ['required', 'string', Rule::in(['active', 'inactive', 'lead'])],
            'notes'   => ['nullable', 'string'],
        ];
    }

    /**
     * Mensagens de erro personalizadas em português.
     */
    public function messages(): array
    {
        return [
            'name.required'   => 'O nome do cliente é obrigatório.',
            'email.required'  => 'O email do cliente é obrigatório.',
            'email.email'     => 'Informe um email válido.',
            'email.unique'    => 'Já existe um cliente com este email.',
            'status.required' => 'O status do cliente é obrigatório.',
            'status.in'       => 'Status inválido. Use: active, inactive ou lead.',
        ];
    }
}
