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
        Schema::create('class_posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');

            $table->string('department');
            $table->string('level');

            $table->string('title');
            $table->text('content')->nullable();

            $table->enum('type', ['announcement', 'course', 'td', 'reminder', 'link'])->default('announcement');

            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_type')->nullable();

            $table->string('external_link')->nullable();

            $table->boolean('is_published')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_posts');
    }
};
