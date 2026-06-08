<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'client_id'   => Client::factory(),
            'title'       => $this->faker->randomElement([
                'Reunião de alinhamento',
                'Apresentação de resultado',
                'Call de feedback',
                'Demonstração do produto',
                'Revisão de contrato',
                'Treinamento',
                'Suporte técnico',
            ]),
            'description' => $this->faker->optional()->sentence(),
            'date'        => $this->faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'time'        => $this->faker->randomElement(['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
            'status'      => $this->faker->randomElement(['scheduled', 'scheduled', 'scheduled', 'completed', 'cancelled']),
        ];
    }
}
