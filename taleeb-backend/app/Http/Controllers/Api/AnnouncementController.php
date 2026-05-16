<?php

namespace App\Http\Controllers\Api;

use App\Helpers\NotificationHelper;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // admin يرى الكل
        if ($user->role === 'admin') {
            return response()->json(Announcement::latest()->get());
        }

        $student = $user->student;

        return response()->json(
            Announcement::where('is_published', true)
                ->where(function ($query) use ($student) {
                    $query->whereNull('department')->orWhere('department', $student->department);
                })
                ->where(function ($query) use ($student) {
                    $query->whereNull('level')->orWhere('level', $student->level);
                })
                ->latest()
                ->get(),
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(
                [
                    'message' => 'Only admin can create announcements.',
                ],
                403,
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'nullable|string',
            'level' => 'nullable|string',
            'is_important' => 'boolean',
            'is_published' => 'boolean',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $validated['attachment_path'] = $file->store('announcements', 'public');
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getClientMimeType();
        }

        unset($validated['attachment']);

        $announcement = Announcement::create($validated);

        // إرسال إشعارات للطلاب المستهدفين
        $students = Student::query()
            ->when($announcement->department, function ($query) use ($announcement) {
                $query->where('department', $announcement->department);
            })
            ->when($announcement->level, function ($query) use ($announcement) {
                $query->where('level', $announcement->level);
            })
            ->get();

        foreach ($students as $student) {
            NotificationHelper::send($student->id, 'New Announcement', $announcement->title, 'announcement', 'announcements');
        }

        return response()->json(
            [
                'message' => 'Announcement created successfully.',
                'data' => $announcement,
            ],
            201,
        );
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(
                [
                    'message' => 'Only admin can delete announcements.',
                ],
                403,
            );
        }

        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully.',
        ]);
    }

    public function downloadAttachment(Request $request, Announcement $announcement)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            $student = $user->student;

            if (
                ! $announcement->is_published ||
                ($announcement->department && $announcement->department !== $student->department) ||
                ($announcement->level && $announcement->level !== $student->level)
            ) {
                return response()->json([
                    'message' => 'You cannot download this attachment.',
                ], 403);
            }
        }

        if (! $announcement->attachment_path || ! Storage::disk('public')->exists($announcement->attachment_path)) {
            return response()->json([
                'message' => 'Attachment not found.',
            ], 404);
        }

        return Storage::disk('public')->download(
            $announcement->attachment_path,
            $announcement->attachment_name ?: basename($announcement->attachment_path),
        );
    }

    public function update(Request $request, Announcement $announcement)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(
                [
                    'message' => 'Only admin can update announcements.',
                ],
                403,
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department' => 'nullable|string',
            'level' => 'nullable|string',
            'is_important' => 'boolean',
            'is_published' => 'boolean',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $validated['attachment_path'] = $file->store('announcements', 'public');
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getClientMimeType();
        }

        unset($validated['attachment']);

        $announcement->update($validated);

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'data' => $announcement,
        ]);
    }
}
