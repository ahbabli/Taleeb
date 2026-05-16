<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'department', 'level', 'is_important', 'is_published', 'attachment_path', 'attachment_name', 'attachment_type'];

    protected $casts = [
        'is_important' => 'boolean',
        'is_published' => 'boolean',
    ];
}
