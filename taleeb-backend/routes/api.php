<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DocumentRequestController;
use App\Http\Controllers\Api\DocumentTypeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AcademicSettingController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\ClassPostController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\AdminAnalyticsController;

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
    Route::get('/schedule', [ScheduleController::class, 'index']);
    Route::post('/schedule', [ScheduleController::class, 'store']);
    Route::put('/schedule/{schedule}', [ScheduleController::class, 'update']);
    Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::delete('/notifications', [NotificationController::class, 'clearAll']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::get('/announcements/{announcement}/attachment', [AnnouncementController::class, 'downloadAttachment']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::get('/academic-settings', [AcademicSettingController::class, 'show']);
    Route::put('/academic-settings', [AcademicSettingController::class, 'update']);
    Route::get('/faq', [FaqController::class, 'index']);
    Route::post('/faq', [FaqController::class, 'store']);
    Route::put('/faq/{faqEntry}', [FaqController::class, 'update']);
    Route::delete('/faq/{faqEntry}', [FaqController::class, 'destroy']);
    Route::post('/assistant/ask', [AssistantController::class, 'ask']);
    Route::get('/class-posts', [ClassPostController::class, 'index']);
    Route::post('/class-posts', [ClassPostController::class, 'store']);
    Route::get('/class-posts/{classPost}/attachment', [ClassPostController::class, 'downloadAttachment']);
    Route::post('/class-posts/{classPost}', [ClassPostController::class, 'update']);
    Route::delete('/class-posts/{classPost}', [ClassPostController::class, 'destroy']);
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole']);
    Route::get('/admin/analytics', [AdminAnalyticsController::class, 'index']);
});
