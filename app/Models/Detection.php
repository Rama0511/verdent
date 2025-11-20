<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Detection extends Model
{
    use HasFactory;

    protected $table = 'detections';

    protected $fillable = ['user_id', 'label_id', 'raw_result', 'image_path', 'result_image_path', 'confidence'];

    protected $casts = [
        'raw_result' => 'array',
        'confidence' => 'float',
    ];

    public function label()
    {
        return $this->belongsTo(DetectionLabel::class, 'label_id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
