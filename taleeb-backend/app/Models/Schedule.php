<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
   protected $fillable = [
    'department',
    'level',
    'day',
    'subject',
    'type',
    'teacher',
    'room',
    'start_time',
    'end_time',
];
}