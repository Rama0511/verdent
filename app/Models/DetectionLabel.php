<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DetectionLabel extends Model
{
    use HasFactory;

    protected $table = 'detection_labels';

    protected $fillable = ['name', 'description'];

    public function detections()
    {
        return $this->hasMany(Detection::class, 'label_id');
    }
}
