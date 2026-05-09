<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DocumentRequestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_types_endpoint_returns_active_types(): void
    {
        DB::table('document_types')->insert([
            [
                'name' => 'Transcript',
                'description' => 'Official academic record.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Archived Type',
                'description' => null,
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->getJson('/api/document-types')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Transcript'])
            ->assertJsonMissing(['name' => 'Archived Type']);
    }

    public function test_document_request_can_be_created_with_valid_student_and_type(): void
    {
        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('students')->insert([
            'id' => 1,
            'user_id' => 1,
            'student_code' => 'STD-001',
            'department' => 'Computer Science',
            'level' => 'S1',
            'academic_year' => '2025-2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('document_types')->insert([
            'id' => 1,
            'name' => 'Transcript',
            'description' => 'Official academic record.',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->postJson('/api/document-requests', [
            'student_id' => 1,
            'document_type_id' => 1,
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('document_requests', [
            'student_id' => 1,
            'document_type_id' => 1,
            'status' => 'pending',
        ]);
    }
}
