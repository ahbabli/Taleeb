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
    Schema::create('schedules', function (Blueprint $table) {
        $table->id();

        // الربط بالطالب (حسب التخصص والمستوى)
        $table->string('department'); // Informatique
        $table->string('level');      // S1, S2...

        // معلومات الحصة
        $table->string('day');        // Monday, Tuesday...
        $table->string('subject');    // Math, Physics...
        $table->string('teacher')->nullable();
        $table->string('room')->nullable();

        // الوقت
        $table->time('start_time');
        $table->time('end_time');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
