<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareMovement extends Model
{
    use HasFactory;

    protected $fillable = ['deal_type', 'amount', 'currency', 'movement_date'];

    protected $casts = [
        'amount' => 'decimal:2',
        'movement_date' => 'date',
    ];
}
