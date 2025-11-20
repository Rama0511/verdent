<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Detection;
use App\Models\DetectionLabel;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AdminController extends Controller
{
    // Render Inertia admin page (only for admin users)
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || ($user->role ?? 'user') !== 'admin') {
            // Non-admins cannot access admin UI — redirect to dashboard
            return redirect()->route('dashboard');
        }

        return \Inertia\Inertia::render('AdminMonitor');
    }

    // Return JSON data for chart and table
    public function data(Request $request)
    {
        // Simple admin gate: ensure user role is admin
        $user = $request->user();
        if (!$user || ($user->role ?? 'user') !== 'admin') {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        // Counts per label
        $labels = DetectionLabel::all();
        $counts = [];
        foreach ($labels as $label) {
            $counts[] = [
                'label' => $label->name,
                'count' => Detection::where('label_id', $label->id)->count(),
            ];
        }

        // Daily summary for the last N days (include zeros)
        $days = intval($request->get('days', 14));
        $days = max(7, min(60, $days)); // keep within reasonable bounds
        $from = Carbon::now()->subDays($days - 1)->startOfDay();

        $raw = Detection::where('created_at', '>=', $from)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        $daily_counts = [];
        for ($i = 0; $i < $days; $i++) {
            $d = $from->copy()->addDays($i)->toDateString();
            $daily_counts[] = [
                'date' => $d,
                'count' => isset($raw[$d]) ? intval($raw[$d]) : 0,
            ];
        }

        // Recent detections with user and label
        $perPage = intval($request->get('per_page', 20));
        $detections = Detection::with(['user', 'label'])->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'counts' => $counts,
            'detections' => $detections,
            'daily_counts' => $daily_counts,
        ]);
    }
}
