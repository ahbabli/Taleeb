<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        return response()->json(
            Notification::where('student_id', $student->id)
                ->latest()
                ->limit(10)
                ->get()
        );
    }

    public function unreadCount(Request $request)
    {
        $student = $request->user()->student;

        return response()->json([
            'count' => Notification::where('student_id', $student->id)
                ->where('is_read', false)
                ->count()
        ]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        $student = $request->user()->student;

        if ($notification->student_id !== $student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => $notification,
        ]);
    }
}