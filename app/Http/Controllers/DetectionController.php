<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Detection;

class DetectionController extends Controller
{
    /**
     * Return detection record and related label info for a given detection id.
     */
    public function show($id)
    {
        $d = Detection::with('label')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'detection' => $d,
            'label' => $d->label,
        ]);
    }
}
