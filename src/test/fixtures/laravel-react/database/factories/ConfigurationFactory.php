<?php

namespace Database\Factories;

use App\Models\Configuration;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Configuration> */
class ConfigurationFactory extends Factory
{
    public function pricing(): static
    {
        return $this->state(['key' => 'pricing']);
    }
}
