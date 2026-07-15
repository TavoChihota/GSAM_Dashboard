<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundUnderManagement extends Model
{
    use HasFactory;

    protected $table = 'funds_under_management';

    protected $fillable = [
        'fund_name', 'value_date', 'currency',
        'opening_balance', 'net_flow', 'closing_balance',
    ];

    protected $casts = [
        'value_date' => 'date',
        'opening_balance' => 'decimal:2',
        'net_flow' => 'decimal:2',
        'closing_balance' => 'decimal:2',
    ];
}
