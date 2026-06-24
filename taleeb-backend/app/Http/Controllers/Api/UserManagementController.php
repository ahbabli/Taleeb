<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can manage users.'], 403);
        }

        return response()->json(
            User::with('student')
                ->latest()
                ->get()
        );
    }

    public function updateRole(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can update roles.'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,department_head,student_representative,student',
            'managed_department' => 'nullable|string',
            'managed_level' => 'nullable|string',
        ]);

        if ($validated['role'] === 'admin' || $validated['role'] === 'student') {
            $validated['managed_department'] = null;
            $validated['managed_level'] = null;
        }

        if ($validated['role'] === 'department_head') {
            $validated['managed_level'] = null;
        }

        if ($validated['role'] === 'student_representative') {
            if (!$validated['managed_department'] || !$validated['managed_level']) {
                return response()->json([
                    'message' => 'Representative must have department and level.'
                ], 422);
            }
        }

        if ($validated['role'] === 'department_head' && !$validated['managed_department']) {
            return response()->json([
                'message' => 'Department head must have a department.'
            ], 422);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User role updated successfully.',
            'data' => $user->load('student'),
        ]);
    }
}