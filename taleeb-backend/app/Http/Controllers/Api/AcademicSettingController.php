<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicSection;
use App\Models\AcademicSetting;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;

class AcademicSettingController extends Controller
{
    public function show()
    {
        return response()->json(
            AcademicSetting::latest()->first()
        );
    }

    public function sections(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can view academic sections.'
            ], 403);
        }

        $sections = AcademicSection::orderBy('name')->pluck('name');

        return response()->json($sections);
    }

    public function storeSection(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can create academic sections.'
            ], 403);
        }

        $request->merge([
            'name' => trim((string) $request->input('name')),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:academic_sections,name',
        ]);

        $section = AcademicSection::create([
            'name' => trim($validated['name']),
        ]);

        return response()->json([
            'message' => 'Academic section created successfully.',
            'data' => $section,
        ], 201);
    }

    public function destroySection(Request $request, AcademicSection $academicSection)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can delete academic sections.'
            ], 403);
        }

        $inUse = Student::where('department', $academicSection->name)->exists()
            || Schedule::where('department', $academicSection->name)->exists()
            || User::where('managed_department', $academicSection->name)->exists();

        if ($inUse) {
            return response()->json([
                'message' => 'This section is already used by students, schedules, or staff scopes.'
            ], 422);
        }

        $academicSection->delete();

        return response()->json([
            'message' => 'Academic section deleted successfully.',
        ]);
    }

    public function update(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can update academic settings.'
            ], 403);
        }

        $validated = $request->validate([
            'academic_year' => 'required|string|max:20',
            'semester_start_date' => 'required|date',
            'semester_end_date' => 'required|date|after:semester_start_date',
            'exams_start_date' => 'nullable|date',
            'exams_end_date' => 'nullable|date|after_or_equal:exams_start_date',
        ]);

        $settings = AcademicSetting::latest()->first();

        if ($settings) {
            $settings->update($validated);
        } else {
            $settings = AcademicSetting::create($validated);
        }

        return response()->json([
            'message' => 'Academic settings updated successfully.',
            'data' => $settings,
        ]);
    }
}
