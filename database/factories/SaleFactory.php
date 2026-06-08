<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        return [
            'client_id'   => Client::factory(),
            'user_id'     => User::factory(),
            'amount'      => $this->faker->randomFloat(2, 50, 5000),
            'description' => $this->faker->randomElement([
                'Consultoria de desenvolvimento',
                'Hospedagem e manutenção',
                'Desenvolvimento de feature',
                'Integração de API',
                'Correção de bugs',
                'Redesign de interface',
                'Otimização de performance',
                'Treinamento de equipe',
            ]),
            'status'    => $this->faker->randomElement(['completed', 'completed', 'completed', 'pending', 'cancelled']),
            'sale_date' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
        ];
    }
}
