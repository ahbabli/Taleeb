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
        Schema::create('document_types', function (Blueprint $table) {
    $table->id();

    // اسم الوثيقة
    $table->string('name'); 
    // مثال: "شهادة التسجيل", "كشف النقط"

    // وصف بسيط
    $table->text('description')->nullable();

    // هل الوثيقة مفعلة أم لا
    $table->boolean('is_active')->default(true);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
