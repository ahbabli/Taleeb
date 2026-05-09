<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    protected $fillable = [
        'student_id',
        'document_type_id',
        'status',
        'admin_note',
        'file_path',
        'requested_at',
        'processed_at',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }
}

