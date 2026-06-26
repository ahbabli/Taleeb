<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $now = now();

        DB::table('users')->updateOrInsert(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        );

        $userId = DB::table('users')->where('email', 'test@example.com')->value('id');

        DB::table('students')->updateOrInsert(
            ['id' => 1],
            [
                'user_id' => $userId,
                'student_code' => 'STD-001',
                'department' => 'Computer Science',
                'level' => 'S1',
                'academic_year' => '2025-2026',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        );

        foreach ([
            'Informatique',
            'Mathématiques',
            'Physique',
            'Chimie',
        ] as $section) {
            DB::table('academic_sections')->updateOrInsert(
                ['name' => $section],
                [
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }

        foreach ([
            ['name' => 'Enrollment Certificate', 'description' => 'Proof of current university enrollment.'],
            ['name' => 'Transcript', 'description' => 'Official academic record of grades.'],
            ['name' => 'Internship Agreement', 'description' => 'Administrative agreement for internship validation.'],
        ] as $documentType) {
            DB::table('document_types')->updateOrInsert(
                ['name' => $documentType['name']],
                [
                    'description' => $documentType['description'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }
}
