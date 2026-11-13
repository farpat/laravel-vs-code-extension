<?php

namespace App\Http\Controllers;

use App\Models\Coupon;

class CouponController extends Controller
{
    public function seeded(): string
    {
        return Coupon::factory()->count(3)->create()->discount_label;
    }
}
