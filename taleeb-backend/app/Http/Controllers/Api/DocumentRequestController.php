<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use App\Helpers\NotificationHelper;

class DocumentRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = DocumentRequest::with(['student', 'documentType'])->latest();

        if ($user->role !== 'admin') {
            $query->where('student_id', $user->student->id);
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
        ]);

        $student = $request->user()->student;

        $documentRequest = DocumentRequest::create([
            'student_id' => $student->id,
            'document_type_id' => $validated['document_type_id'],
            'status' => 'pending',
        ]);

        return response()->json(
            [
                'message' => 'Document request created successfully',
                'data' => $documentRequest->load(['student', 'documentType']),
            ],
            201,
        );
    }
    public function updateStatus(Request $request, DocumentRequest $documentRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,approved,rejected,ready',
            'admin_note' => 'nullable|string',
        ]);

        $documentRequest->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'processed_at' => now(),
        ]);
        if ($request->status === 'rejected') {
            NotificationHelper::send($documentRequest->student_id, 'Request Rejected', 'Your request has been rejected. Reason: ' . $request->admin_note, 'request', 'requests');
        }
        if ($request->status === 'ready') {
            NotificationHelper::send($documentRequest->student_id, 'Document Ready', 'Your document is ready for download.', 'request', 'requests');
        }
        return response()->json([
            'message' => 'Request status updated successfully',
            'data' => $documentRequest,
        ]);
    }

    public function destroy(Request $request, DocumentRequest $documentRequest)
    {
        $student = $request->user()->student;

        if ($documentRequest->student_id !== $student->id) {
            return response()->json(
                [
                    'message' => 'You are not allowed to delete this request.',
                ],
                403,
            );
        }

        if (!in_array($documentRequest->status, ['pending', 'processing'])) {
            return response()->json(
                [
                    'message' => 'This request cannot be deleted at this stage.',
                ],
                403,
            );
        }

        $documentRequest->delete();

        return response()->json([
            'message' => 'Request deleted successfully',
        ]);
    }
    public function uploadDocument(Request $request, DocumentRequest $documentRequest)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(
                [
                    'message' => 'Only admin can upload documents.',
                ],
                403,
            );
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:5120',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $documentRequest->update([
            'file_path' => $path,
            'status' => 'ready',
            'admin_note' => 'Your document is ready for download.',
            'processed_at' => now(),
        ]);
        NotificationHelper::send($documentRequest->student_id, 'Document Uploaded', 'Your requested document has been uploaded and is ready.', 'request', 'requests');

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $documentRequest->load(['student', 'documentType']),
            'file_url' => asset('storage/' . $path),
        ]);
    }
}
