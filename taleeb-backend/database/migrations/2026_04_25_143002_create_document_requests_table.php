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
        Schema::create('document_requests', function (Blueprint $table) {
    $table->id();

    // الطالب صاحب الطلب
    $table->foreignId('student_id')->constrained()->onDelete('cascade');

    // نوع الوثيقة
    $table->foreignId('document_type_id')->constrained()->onDelete('cascade');

    // حالة الطلب
    $table->enum('status', [
        'pending',
        'processing',
        'approved',
        'rejected',
        'ready'
    ])->default('pending');

    // ملاحظة من الإدارة (اختياري)
    $table->text('admin_note')->nullable();

    // مسار الملف (PDF)
    $table->string('file_path')->nullable();

    // تواريخ مهمة
    $table->timestamp('requested_at')->useCurrent();
    $table->timestamp('processed_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
