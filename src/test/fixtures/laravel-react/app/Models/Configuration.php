<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static \Database\Factories\ConfigurationFactory factory($count = null, $state = [])
 */
class Configuration extends Model
{
    protected function formattedValue(): Attribute
    {
        return Attribute::make(
            get: fn (): string => (string) $this->value,
            set: fn (string $value): array => ['value' => $value],
        );
    }
}
