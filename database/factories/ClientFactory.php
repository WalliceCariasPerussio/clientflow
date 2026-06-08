<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'name'       => $this->faker->name(),
            'email'      => $this->faker->unique()->safeEmail(),
            'phone'      => $this->faker->phoneNumber(),
            'company_id' => Company::factory(),
            'status'     => $this->faker->randomElement(['active', 'inactive', 'lead']),
            'notes'      => $this->faker->sentence(),
            'user_id'    => User::factory(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => 'active']);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'inactive']);
    }

    public function lead(): static
    {
        return $this->state(fn () => ['status' => 'lead']);
    }
}
