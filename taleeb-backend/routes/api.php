<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DocumentRequestController;
use App\Http\Controllers\Api\DocumentTypeController;
use App\Http\Controllers\Api\AuthController;

Route::get('/document-types', [DocumentTypeController::class, 'index']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/document-requests', [DocumentRequestController::class, 'index']);
    Route::post('/document-requests', [DocumentRequestController::class, 'store']);
    Route::delete('/document-requests/{documentRequest}', [DocumentRequestController::class, 'destroy']);
    Route::patch('/document-requests/{documentRequest}/status', [DocumentRequestController::class, 'updateStatus']);
    Route::post('/document-requests/{documentRequest}/upload', [DocumentRequestController::class, 'uploadDocument']);
});

