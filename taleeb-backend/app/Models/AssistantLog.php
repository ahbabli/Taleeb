<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssistantLog extends Model
{
    protected $fillable = [
        'student_id',
        'question',
        'answer',
        'source',
        'score',
        'link',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}