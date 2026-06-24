<?php

namespace App\Http\Controllers\Api;

use App\Helpers\NotificationHelper;
use App\Http\Controllers\Controller;
use App\Models\ClassPost;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClassPostController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(
                ClassPost::with('author')->latest()->get()
            );
        }

        if ($user->role === 'department_head') {
            return response()->json(
                ClassPost::with('author')
                    ->where('department', $user->managed_department)
                    ->latest()
                    ->get()
            );
        }

        $student = $user->student;

        return response()->json(
            ClassPost::with('author')
                ->where('department', $student->department)
                ->where('level', $student->level)
                ->where('is_published', true)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'department_head', 'student_representative'])) {
            return response()->json([
                'message' => 'You are not allowed to create class posts.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|in:announcement,course,td,reminder,link',
            'department' => 'nullable|string',
            'level' => 'nullable|string',
            'external_link' => 'nullable|string',
            'is_published' => 'boolean',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        $scope = $this->resolveScope($user, $validated);

        $validated['department'] = $scope['department'];
        $validated['level'] = $scope['level'];
        $validated['author_id'] = $user->id;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $validated['attachment_path'] = $file->store('class-posts', 'public');
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getClientMimeType();
        }

        unset($validated['attachment']);

        $post = ClassPost::create($validated);

        $this->notifyTargetStudents($post, 'New Class Update');

        return response()->json([
            'message' => 'Class post created successfully.',
            'data' => $post->load('author'),
        ], 201);
    }

    public function update(Request $request, ClassPost $classPost)
    {
        $user = $request->user();

        if (!$this->canManagePost($user, $classPost)) {
            return response()->json([
                'message' => 'You are not allowed to update this class post.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|in:announcement,course,td,reminder,link',
            'department' => 'nullable|string',
            'level' => 'nullable|string',
            'external_link' => 'nullable|string',
            'is_published' => 'boolean',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        $scope = $this->resolveScope($user, $validated);

        $validated['department'] = $scope['department'];
        $validated['level'] = $scope['level'];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $validated['attachment_path'] = $file->store('class-posts', 'public');
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getClientMimeType();
        }

        unset($validated['attachment']);

        $classPost->update($validated);

        $this->notifyTargetStudents($classPost, 'Class Update Edited');

        return response()->json([
            'message' => 'Class post updated successfully.',
            'data' => $classPost->load('author'),
        ]);
    }

    public function destroy(Request $request, ClassPost $classPost)
    {
        $user = $request->user();

        if (!$this->canManagePost($user, $classPost)) {
            return response()->json([
                'message' => 'You are not allowed to delete this class post.'
            ], 403);
        }

        $classPost->delete();

        return response()->json([
            'message' => 'Class post deleted successfully.'
        ]);
    }

    public function downloadAttachment(Request $request, ClassPost $classPost)
    {
        $user = $request->user();

        if (! $this->canViewPost($user, $classPost)) {
            return response()->json([
                'message' => 'You cannot download this attachment.',
            ], 403);
        }

        if (! $classPost->attachment_path || ! Storage::disk('public')->exists($classPost->attachment_path)) {
            return response()->json([
                'message' => 'Attachment not found.',
            ], 404);
        }

        return Storage::disk('public')->download(
            $classPost->attachment_path,
            $classPost->attachment_name ?: basename($classPost->attachment_path),
        );
    }

    private function resolveScope($user, array $data): array
    {
        if ($user->role === 'admin') {
            return [
                'department' => $data['department'] ?? null,
                'level' => $data['level'] ?? null,
            ];
        }

        if ($user->role === 'department_head') {
            return [
                'department' => $user->managed_department,
                'level' => $data['level'] ?? null,
            ];
        }

        return [
            'department' => $user->managed_department,
            'level' => $user->managed_level,
        ];
    }

    private function canManagePost($user, ClassPost $post): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'department_head') {
            return $post->department === $user->managed_department;
        }

        if ($user->role === 'student_representative') {
            return $post->author_id === $user->id;
        }

        return false;
    }

    private function canViewPost($user, ClassPost $post): bool
    {
        if ($this->canManagePost($user, $post)) {
            return true;
        }

        $student = $user->student;

        return $post->is_published &&
            $student &&
            $post->department === $student->department &&
            $post->level === $student->level;
    }

    private function notifyTargetStudents(ClassPost $post, string $title): void
    {
        if (!$post->is_published) {
            return;
        }

        $students = Student::where('department', $post->department)
            ->where('level', $post->level)
            ->get();

        foreach ($students as $student) {
            NotificationHelper::send(
                $student->id,
                $title,
                $post->title,
                'class_post',
                'class-feed'
            );
        }
    }
}
