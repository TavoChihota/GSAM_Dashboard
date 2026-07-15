<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_code')->unique();
            $table->string('name');
            $table->enum('segment', ['Institutional', 'Corporate', 'Retail', 'Pension Fund']);
            $table->enum('status', ['Active', 'Dormant', 'Pending', 'Closed'])->default('Active');
            $table->decimal('aum', 18, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->date('onboarded_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
