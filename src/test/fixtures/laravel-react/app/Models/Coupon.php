<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected function discountLabel(): Attribute
    {
        return Attribute::make(
            get: fn (): string => $this->percent.' %',
        );
    }
}
