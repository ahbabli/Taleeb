<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FaqEntry;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // admin يرى الكل
        if ($user->role === 'admin') {
            return response()->json(
                FaqEntry::latest()->get()
            );
        }

        // الطالب يرى المنشور فقط
        return response()->json(
            FaqEntry::where('is_published', true)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can create FAQ entries.'
            ], 403);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $faq = FaqEntry::create($validated);

        return response()->json([
            'message' => 'FAQ created successfully.',
            'data' => $faq,
        ], 201);
    }

    public function update(Request $request, FaqEntry $faqEntry)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can update FAQ entries.'
            ], 403);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $faqEntry->update($validated);

        return response()->json([
            'message' => 'FAQ updated successfully.',
            'data' => $faqEntry,
        ]);
    }

    public function destroy(Request $request, FaqEntry $faqEntry)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admin can delete FAQ entries.'
            ], 403);
        }

        $faqEntry->delete();

        return response()->json([
            'message' => 'FAQ deleted successfully.'
        ]);
    }
}