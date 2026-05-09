<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();

            // ربط الطالب مع user
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // معلومات الطالب
            $table->string('student_code')->unique(); // رقم الطالب
            $table->string('department'); // الشعبة
            $table->string('level'); // السنة (S1, S2...)
            $table->string('academic_year'); // السنة الدراسية

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
