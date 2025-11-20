<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('splash', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Render the application Home for authenticated users at /dashboard
    Route::get('dashboard', function () {
        return Inertia::render('Home');
    })->name('dashboard');

    // Detection pages
    Route::get('detect', function () {
        return Inertia::render('DetectionPage');
    })->name('detect');

    Route::get('detect/camera', function () {
        return Inertia::render('CameraPage');
    })->name('detect.camera');

    Route::get('result', function () {
        return Inertia::render('ResultPage');
    })->name('detect.result');

    // Endpoint for handling file uploads and proxying to ML model
    Route::post('predict', [\App\Http\Controllers\PredictionController::class, 'predict'])->name('predict');
    
    // Return detection + label info for result page
    Route::get('detection/{id}', [\App\Http\Controllers\DetectionController::class, 'show'])->name('detection.show');

    // Admin monitoring (Inertia page)
    Route::get('admin', [\App\Http\Controllers\AdminController::class, 'index'])->name('admin.monitor');
    // Admin data endpoint (chart + table)
    Route::get('admin/detections', [\App\Http\Controllers\AdminController::class, 'data'])->name('admin.detections');
});

require __DIR__.'/settings.php';

// Note: /dashboard now renders the app Home for authenticated users.
