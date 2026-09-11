<?php

namespace App\Http\Controllers;

use App\Models\Configuration;

class ConfigurationController extends Controller
{
    public function show(Configuration $configuration): string
    {
        return $configuration->formatted_value;
    }

    public function update(Configuration $configuration, string $value): string
    {
        $configuration->formatted_value = $value;

        return $configuration->formatted_value;
    }
}
