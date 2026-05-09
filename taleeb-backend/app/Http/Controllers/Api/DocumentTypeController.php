<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;

class DocumentTypeController extends Controller
{
    public function index()
    {
        return response()->json(
            DocumentType::where('is_active', true)
                ->orderBy('name')
                ->get()
        );
    }
}