<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

/**
 * Policy do modelo Client.
 *
 * Garante que um usuário só pode acessar clientes que ele mesmo criou.
 */
class ClientPolicy
{
    /**
     * Determina se o usuário pode visualizar o cliente.
     */
    public function view(User $user, Client $client): bool
    {
        return $user->id === $client->user_id;
    }

    /**
     * Determina se o usuário pode atualizar o cliente.
     */
    public function update(User $user, Client $client): bool
    {
        return $user->id === $client->user_id;
    }

    /**
     * Determina se o usuário pode excluir o cliente.
     */
    public function delete(User $user, Client $client): bool
    {
        return $user->id === $client->user_id;
    }
}
