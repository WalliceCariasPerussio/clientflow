<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $appointments = Appointment::where('user_id', $userId)
            ->with('client:id,name')
            ->when($request->date, fn($q) => $q->where('date', $request->date))
            ->when($request->month, fn($q) => $q->whereBetween('date', [
                "{$request->month}-01", "{$request->month}-31"
            ]))
            ->orderBy('date')
            ->orderBy('time')
            ->paginate($request->per_page ?? 50);

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id'   => 'required|exists:clients,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'status'      => 'required|in:scheduled,completed,cancelled',
        ]);
        $data['user_id'] = $request->user()->id;
        return response()->json(Appointment::create($data)->load('client:id,name'), 201);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        if ($appointment->user_id !== $request->user()->id) return response()->json(['message' => 'Not found.'], 404);
        $data = $request->validate([
            'client_id'   => 'sometimes|exists:clients,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date'        => 'sometimes|date',
            'time'        => 'sometimes|date_format:H:i',
            'status'      => 'sometimes|in:scheduled,completed,cancelled',
        ]);
        $appointment->update($data);
        return response()->json($appointment->load('client:id,name'));
    }

    public function destroy(Request $request, Appointment $appointment): JsonResponse
    {
        if ($appointment->user_id !== $request->user()->id) return response()->json(['message' => 'Not found.'], 404);
        $appointment->delete();
        return response()->json(null, 204);
    }
}
