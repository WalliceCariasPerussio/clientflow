<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Popula o banco com dados de demonstração.
     *
     * Cria um usuário demo e 20 clientes de exemplo para o portfólio ClientFlow.
     */
    public function run(): void
    {
        // Usuário demo para testar a aplicação
        $user = User::factory()->create([
            'name'  => 'Demo User',
            'email' => 'demo@clientflow.app',
        ]);

        // 20 clientes com distribuição variada de status
        $statuses = [
            'active'   => 10,  // 10 ativos
            'inactive' => 4,   // 4 inativos
            'lead'     => 6,   // 6 leads
        ];

        foreach ($statuses as $status => $count) {
            Client::factory($count)->{$status}()->create([
                'user_id' => $user->id,
            ]);
        }
    }
}
