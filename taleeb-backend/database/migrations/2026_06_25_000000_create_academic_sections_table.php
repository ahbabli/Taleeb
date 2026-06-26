<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        $now = now();

        DB::table('academic_sections')->insert([
            ['name' => 'Informatique', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mathématiques', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Physique', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Chimie', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_sections');
    }
};
