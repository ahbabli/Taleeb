<?php

namespace App\Helpers;

use App\Models\Notification;

class NotificationHelper
{
    public static function send(
        int $studentId,
        string $title,
        string $message,
        string $type = 'system',
        ?string $link = null
    ): void {
        Notification::create([
            'student_id' => $studentId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
            'is_read' => false,
        ]);
    }
}