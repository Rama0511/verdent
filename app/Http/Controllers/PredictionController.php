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

        // Store original image locally in Laravel storage
        $path = $file->storePubliclyAs('detections', Str::random(40) . '.' . $file->getClientOriginalExtension(), 'public');
        $originalImagePath = $path ? ('/storage/' . $path) : null;

        try {
            $modelApi = env('MODEL_API_URL', 'https://agroparkpkklampung.my.id/predict/');

            $response = Http::withOptions(['verify' => true, 'timeout' => 30])
                ->accept('application/json')
                ->attach('file', fopen($file->getPathname(), 'r'), $file->getClientOriginalName())
                ->post($modelApi);

            if ($response->failed()) {
                return response()->json(['status' => 'error', 'message' => 'External API error'], 500);
            }

            $resp = $response->json();

            // expected contract: { status: 'success', result: {...} }
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

            // Build full URL for result image from FastAPI
            $resultImageUrl = null;
            
            if (isset($resp['result']['output_path'])) {
                $parsed = parse_url($modelApi);
                $origin = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                if (isset($parsed['port'])) {
                    $origin .= ':' . $parsed['port'];
                }
                $resultImageUrl = rtrim($origin, '/') . '/' . ltrim($resp['result']['output_path'], '/');
            }

            $d = Detection::create([
                'user_id' => $request->user() ? $request->user()->id : null,
                'label_id' => $matchedLabelId,
                'raw_result' => $rawResult,
                'image_path' => $originalImagePath,
                'result_image_path' => $resultImageUrl,
                'confidence' => $topConfidence,
            ]);

            return response()->json([
                'status' => $resp['status'] ?? 'success',
                'result' => $resp['result'] ?? $resp,
                'detection_id' => $d->id,
                'image_path' => $originalImagePath,
                'result_image_path' => $resultImageUrl,
                'model_image_url' => $resultImageUrl,
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
