<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Detection;
use App\Models\DetectionLabel;

class PredictionController extends Controller
{
    /**
     * Receive uploaded image, forward to external model API, match results with DB,
     * store detection record and return JSON expected by the frontend.
     */
    public function predict(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg|max:10240',
        ]);

        $file = $request->file('file');

        // store a copy locally (optional) to public/storage/detections
        $path = $file->storePubliclyAs('detections', Str::random(40) . '.' . $file->getClientOriginalExtension(), 'public');

        try {
                $modelApi = env('MODEL_API_URL', 'http://agroparkpkklampung.my.id:8001/predict/');

                $response = Http::withOptions(['verify' => true, 'timeout' => 30])
                    ->accept('application/json')
                    ->attach('file', fopen($file->getPathname(), 'r'), $file->getClientOriginalName())
                    ->post($modelApi);

            if ($response->failed()) {
                return response()->json(['status' => 'error', 'message' => 'External API error'], 500);
            }

            $resp = $response->json();

            // expected contract: { status: 'success', result: [...] }
            $rawResult = $resp;

            $matchedLabelId = null;
            $topConfidence = null;

            // Try to match any label name returned by model with our detection_labels table
            // The model may return either:
            // - result: [ { label/name/class_name, confidence }, ... ]
            // - result: { output_path: ..., detections: [ { class_name, confidence, ... }, ... ] }
            if (isset($resp['result'])) {
                // Case: result contains detections array
                if (isset($resp['result']['detections']) && is_array($resp['result']['detections'])) {
                    foreach ($resp['result']['detections'] as $item) {
                        if (!is_array($item)) continue;
                        $labelName = $item['class_name'] ?? $item['label'] ?? $item['name'] ?? null;
                        $confidence = isset($item['confidence']) ? (float) $item['confidence'] : null;
                        if ($labelName) {
                            $label = DetectionLabel::whereRaw('LOWER(name) = ?', [strtolower($labelName)])->first();
                            if ($label) {
                                $matchedLabelId = $label->id;
                                $topConfidence = $confidence;
                                break;
                            }
                        }
                    }
                }

                // Fallback: if result itself is a numeric-indexed array
                if (!$matchedLabelId && is_array($resp['result'])) {
                    foreach ($resp['result'] as $item) {
                        if (!is_array($item)) continue;
                        $labelName = $item['label'] ?? ($item['name'] ?? null);
                        $confidence = isset($item['confidence']) ? (float) $item['confidence'] : null;
                        if ($labelName) {
                            $label = DetectionLabel::whereRaw('LOWER(name) = ?', [strtolower($labelName)])->first();
                            if ($label) {
                                $matchedLabelId = $label->id;
                                $topConfidence = $confidence;
                                break;
                            }
                        }
                    }
                }
            }

            $d = Detection::create([
                'user_id' => $request->user() ? $request->user()->id : null,
                'label_id' => $matchedLabelId,
                'raw_result' => $rawResult,
                'image_path' => $path ? ('/storage/' . $path) : null,
                'confidence' => $topConfidence,
            ]);

            // If the model returned an output_path, build a full URL to the model host and download result image
            $modelImageUrl = null;
            $resultImagePath = null;
            if (isset($resp['result']['output_path'])) {
                $parsed = parse_url($modelApi);
                $origin = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                if (isset($parsed['port'])) {
                    $origin .= ':' . $parsed['port'];
                }
                $modelImageUrl = rtrim($origin, '/') . '/' . ltrim($resp['result']['output_path'], '/');
                
                // Download result image and save locally
                try {
                    $resultImageResponse = Http::withOptions(['verify' => true, 'timeout' => 15])->get($modelImageUrl);
                    if ($resultImageResponse->successful()) {
                        $ext = pathinfo($resp['result']['output_path'], PATHINFO_EXTENSION) ?: 'jpg';
                        $resultFilename = 'result_' . Str::random(40) . '.' . $ext;
                        $resultPath = 'detections/' . $resultFilename;
                        \Storage::disk('public')->put($resultPath, $resultImageResponse->body());
                        $resultImagePath = '/storage/' . $resultPath;
                        
                        // Update detection with result image path
                        $d->update(['result_image_path' => $resultImagePath]);
                    }
                } catch (\Throwable $e) {
                    // Log error but continue
                    report($e);
                }
            }

            return response()->json([
                'status' => $resp['status'] ?? 'success',
                'result' => $resp['result'] ?? $resp,
                'detection_id' => $d->id,
                'image_path' => $d->image_path,
                'result_image_path' => $resultImagePath,
                'model_image_url' => $modelImageUrl,
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
