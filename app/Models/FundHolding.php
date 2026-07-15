<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundHolding extends Model
{
    use HasFactory;

    protected $fillable = ['category', 'amount', 'currency', 'value_date'];

    protected $casts = [
        'amount' => 'decimal:2',
        'value_date' => 'date',
    ];
}
