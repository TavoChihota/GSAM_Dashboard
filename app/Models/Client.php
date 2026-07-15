<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_code',
        'name',
        'segment',
        'status',
        'aum',
        'currency',
        'onboarded_date',
    ];

    protected $casts = [
        'aum'             => 'decimal:2',
        'onboarded_date'  => 'date',
    ];
}
