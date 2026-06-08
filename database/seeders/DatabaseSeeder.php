<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Popula o banco com dados de demonstração.
     *
     * Cria um usuário demo, 29 empresas e 32 clientes vinculados.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name'  => 'Ana Silva',
            'email' => 'demo@clientflow.app',
        ]);

        // 29 empresas
        $companies = Company::factory(29)->create(['user_id' => $user->id]);

        // 10 ativos
        for ($i = 0; $i < 10; $i++) {
            Client::factory()->active()->create([
                'user_id'    => $user->id,
                'company_id' => $companies->random()->id,
            ]);
        }

        // 4 inativos
        for ($i = 0; $i < 4; $i++) {
            Client::factory()->inactive()->create([
                'user_id'    => $user->id,
                'company_id' => $companies->random()->id,
            ]);
        }

        // 6 leads
        for ($i = 0; $i < 6; $i++) {
            Client::factory()->lead()->create([
                'user_id'    => $user->id,
                'company_id' => $companies->random()->id,
            ]);
        }

        // +12 extras pra completar 32
        for ($i = 0; $i < 12; $i++) {
            Client::factory()->create([
                'user_id'    => $user->id,
                'company_id' => $companies->random()->id,
            ]);
        }
    }
}
