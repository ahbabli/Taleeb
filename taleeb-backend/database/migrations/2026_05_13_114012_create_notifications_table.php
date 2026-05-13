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
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();

        // الطالب المستهدف
        $table->foreignId('student_id')
            ->constrained()
            ->onDelete('cascade');

        // محتوى الإشعار
        $table->string('title');
        $table->text('message');

        // نوع الإشعار
        $table->string('type')->nullable();
        // request / schedule / announcement / system

        // الصفحة التي يفتحها
        $table->string('link')->nullable();
        // requests / schedule / faq ...

        // هل تمت قراءته
        $table->boolean('is_read')->default(false);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
