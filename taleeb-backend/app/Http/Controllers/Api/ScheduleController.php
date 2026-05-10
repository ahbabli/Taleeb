<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    private function hasScheduleConflict(array $data, ?int $ignoreId = null): bool
    {
        return Schedule::where('department', $data['department'])
            ->where('level', $data['level'])
            ->where('day', $data['day'])
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->where(function ($query) use ($data) {
                $query->where('start_time', '<', $data['end_time'])->where('end_time', '>', $data['start_time']);
            })
            ->exists();
    }
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(Schedule::orderBy('day')->orderBy('start_time')->get());
        }

        $student = $user->student;

        return response()->json(Schedule::where('department', $student->department)->where('level', $student->level)->orderBy('day')->orderBy('start_time')->get());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can create schedules.'], 403);
        }

        $validated = $request->validate([
            'department' => 'required|string',
            'level' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'type' => 'required|in:cours,td',
            'teacher' => 'nullable|string',
            'room' => 'nullable|string',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);
        if ($this->hasScheduleConflict($validated)) {
            return response()->json(
                [
                    'message' => 'Schedule conflict: another session already exists at this time for this department and level.',
                ],
                422,
            );
        }

        $schedule = Schedule::create($validated);

        return response()->json(
            [
                'message' => 'Schedule created successfully.',
                'data' => $schedule,
            ],
            201,
        );
    }

    public function update(Request $request, Schedule $schedule)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can update schedules.'], 403);
        }

        $validated = $request->validate([
            'department' => 'required|string',
            'level' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'type' => 'required|in:cours,td',
            'teacher' => 'nullable|string',
            'room' => 'nullable|string',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
        ]);

        if ($this->hasScheduleConflict($validated, $schedule->id)) {
            return response()->json(
                [
                    'message' => 'Schedule conflict: another session already exists at this time for this department and level.',
                ],
                422,
            );
        }

        $schedule->update($validated);

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'data' => $schedule,
        ]);
    }

    public function destroy(Request $request, Schedule $schedule)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admin can delete schedules.'], 403);
        }

        $schedule->delete();

        return response()->json([
            'message' => 'Schedule deleted successfully.',
        ]);
    }
}
