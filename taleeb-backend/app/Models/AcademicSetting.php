<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicSetting extends Model
{
    protected $fillable = [
        'academic_year',
        'semester_start_date',
        'semester_end_date',
        'exams_start_date',
        'exams_end_date',
    ];
}