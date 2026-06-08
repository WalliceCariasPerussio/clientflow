<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use App\Models\Sale;
use App\Models\Transaction;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name'  => 'Ana Silva',
            'email' => 'demo@clientflow.app',
        ]);

        $companies = Company::factory(29)->create(['user_id' => $user->id]);

        for ($i = 0; $i < 10; $i++) {
            Client::factory()->active()->create(['user_id' => $user->id, 'company_id' => $companies->random()->id]);
        }
        for ($i = 0; $i < 4; $i++) {
            Client::factory()->inactive()->create(['user_id' => $user->id, 'company_id' => $companies->random()->id]);
        }
        for ($i = 0; $i < 6; $i++) {
            Client::factory()->lead()->create(['user_id' => $user->id, 'company_id' => $companies->random()->id]);
        }
        for ($i = 0; $i < 12; $i++) {
            Client::factory()->create(['user_id' => $user->id, 'company_id' => $companies->random()->id]);
        }

        $activeClients = Client::where('user_id', $user->id)->where('status', 'active')->get();
        foreach ($activeClients as $client) {
            $numSales = rand(1, 6);
            for ($i = 0; $i < $numSales; $i++) {
                Sale::factory()->create(['user_id' => $user->id, 'client_id' => $client->id]);
            }
        }

        // 40 transações financeiras
        for ($i = 0; $i < 40; $i++) {
            Transaction::factory()->create(['user_id' => $user->id]);
        }

        // 15 compromissos
        for ($i = 0; $i < 15; $i++) {
            Appointment::factory()->create(['user_id' => $user->id]);
        }
    }
}
