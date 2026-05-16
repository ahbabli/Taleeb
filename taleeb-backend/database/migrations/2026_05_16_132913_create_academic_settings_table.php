<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('academic_settings', function (Blueprint $table) {
        $table->id();

        $table->string('academic_year')->default('2025-2026');

        $table->date('semester_start_date');
        $table->date('semester_end_date');

        $table->date('exams_start_date')->nullable();
        $table->date('exams_end_date')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_settings');
    }
};
