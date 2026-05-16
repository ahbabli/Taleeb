<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicSetting;
use Illuminate\Http\Request;

class AcademicSettingController extends Controller
{
    public function show()
    {
        return response()->json(
            AcademicSetting::latest()->first()
        );
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