<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\DocumentRequest;
use App\Models\Announcement;
use App\Models\FaqEntry;
use App\Models\ClassPost;
use App\Models\DocumentType;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(
                [
                    'message' => 'Only admin can view analytics.',
                ],
                403,
            );
        }
        $requestsByStatus = DocumentRequest::selectRaw('status, COUNT(*) as total')->groupBy('status')->get();

        $mostRequestedDocuments = DocumentRequest::with('documentType')
            ->selectRaw('document_type_id, COUNT(*) as total')
            ->groupBy('document_type_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'document' => $item->documentType?->name ?? 'Unknown',
                    'total' => $item->total,
                ];
            });

        $usersByRole = User::selectRaw('role, COUNT(*) as total')->groupBy('role')->get();

        return response()->json([
            'total_users' => User::count(),
            'total_students' => Student::count(),

            'total_requests' => DocumentRequest::count(),
            'pending_requests' => DocumentRequest::where('status', 'pending')->count(),
            'processing_requests' => DocumentRequest::where('status', 'processing')->count(),
            'ready_documents' => DocumentRequest::where('status', 'ready')->count(),
            'rejected_requests' => DocumentRequest::where('status', 'rejected')->count(),

            'total_announcements' => Announcement::count(),
            'published_announcements' => Announcement::where('is_published', true)->count(),

            'total_faq' => FaqEntry::count(),
            'published_faq' => FaqEntry::where('is_published', true)->count(),

            'total_class_posts' => ClassPost::count(),
            'published_class_posts' => ClassPost::where('is_published', true)->count(),
            'requests_by_status' => $requestsByStatus,
            'most_requested_documents' => $mostRequestedDocuments,
            'users_by_role' => $usersByRole,
        ]);
    }
}
