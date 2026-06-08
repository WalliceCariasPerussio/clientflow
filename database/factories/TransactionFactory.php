<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['income', 'income', 'income', 'expense']);
        $categories = [
            'Serviço', 'Produto', 'Assinatura', 'Consultoria',
            'Manutenção', 'Hospedagem', 'Software', 'Marketing',
        ];

        return [
            'user_id'     => User::factory(),
            'type'        => $type,
            'amount'      => $type === 'income'
                ? $this->faker->randomFloat(2, 100, 3000)
                : $this->faker->randomFloat(2, 10, 500),
            'description' => $this->faker->sentence(3),
            'category'    => $this->faker->randomElement($categories),
            'date'        => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
        ];
    }
}
