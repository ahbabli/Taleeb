<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistantLog;
use Illuminate\Http\Request;

class AdminAssistantLogController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can view assistant logs.'
            ], 403);
        }

        return response()->json(
            AssistantLog::with('student')
                ->latest()
                ->limit(100)
                ->get()
        );
    }

    public function fallbackQuestions(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can view assistant logs.'
            ], 403);
        }

        return response()->json(
            AssistantLog::where('source', 'fallback')
                ->latest()
                ->limit(50)
                ->get()
        );
    }
}