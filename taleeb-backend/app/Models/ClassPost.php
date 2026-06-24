<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassPost extends Model
{
    protected $fillable = [
        'author_id',
        'department',
        'level',
        'title',
        'content',
        'type',
        'attachment_path',
        'attachment_name',
        'attachment_type',
        'external_link',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}