<?php

namespace App\Actions\Fortify;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request)
    {
        $user = $request->user();

        $redirect = '/dashboard';
        if ($user && ($user->role ?? 'user') === 'admin') {
            $redirect = '/admin';
        }

        // If the request is an Inertia request, use Inertia::location
        if ($request->header('X-Inertia')) {
            return Inertia::location(url($redirect));
        }

        // For JSON requests, return the URL so client can handle it
        if ($request->wantsJson()) {
            return response()->json(['url' => $redirect]);
        }

        return redirect()->to($redirect);
    }
}
