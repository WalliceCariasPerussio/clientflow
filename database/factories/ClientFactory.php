<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory para o modelo Client.
 * Gera dados realistas para testes e seeders.
 *
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    /**
     * Define o estado padrão do modelo.
     */
    public function definition(): array
    {
        return [
            'name'    => fake()->name(),
            'email'   => fake()->unique()->safeEmail(),
            'phone'   => fake()->phoneNumber(),
            'company' => fake()->company(),
            'status'  => fake()->randomElement(['active', 'inactive', 'lead']),
            'notes'   => fake()->sentence(),
            'user_id' => User::factory(),
        ];
    }

    /**
     * Estado: cliente ativo.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Estado: cliente inativo.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Estado: lead.
     */
    public function lead(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'lead',
        ]);
    }
}
