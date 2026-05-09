<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(
                Schedule::orderBy('day')->orderBy('start_time')->get()
            );
        }

        $student = $user->student;

        return response()->json(
            Schedule::where('department', $student->department)
                ->where('level', $student->level)
                ->orderBy('day')
                ->orderBy('start_time')
                ->get()
        );
    }
}