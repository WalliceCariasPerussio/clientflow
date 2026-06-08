<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $sales = Sale::where('user_id', $userId)
            ->with('client:id,name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('description', 'like', "%{$request->search}%")
                ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%{$request->search}%")))
            ->orderByDesc('sale_date')
            ->paginate($request->per_page ?? 15);

        return response()->json($sales);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id'   => 'required|exists:clients,id',
            'amount'      => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'status'      => 'required|in:completed,pending,cancelled',
            'sale_date'   => 'required|date',
        ]);

        $data['user_id'] = $request->user()->id;

        $sale = Sale::create($data);

        return response()->json($sale->load('client:id,name'), 201);
    }

    public function show(Request $request, Sale $sale): JsonResponse
    {
        if ($sale->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json($sale->load('client:id,name'));
    }

    public function update(Request $request, Sale $sale): JsonResponse
    {
        if ($sale->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $data = $request->validate([
            'client_id'   => 'sometimes|exists:clients,id',
            'amount'      => 'sometimes|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'status'      => 'sometimes|in:completed,pending,cancelled',
            'sale_date'   => 'sometimes|date',
        ]);

        $sale->update($data);

        return response()->json($sale->load('client:id,name'));
    }

    public function destroy(Request $request, Sale $sale): JsonResponse
    {
        if ($sale->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $sale->delete();

        return response()->json(null, 204);
    }

    /**
     * Retorna vendas agrupadas por mês (últimos 6 meses) para gráficos.
     */
    public function monthly(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $sales = Sale::where('user_id', $userId)
            ->where('status', 'completed')
            ->where('sale_date', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("strftime('%Y-%m', sale_date) as month"),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json(['data' => $sales]);
    }

    /**
     * Retorna totais para o dashboard (mês atual, total geral, pendentes).
     */
    public function totals(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $thisMonth = now()->startOfMonth();

        return response()->json([
            'data' => [
                'total_revenue'     => Sale::where('user_id', $userId)->completed()->sum('amount'),
                'this_month'        => Sale::where('user_id', $userId)->completed()->where('sale_date', '>=', $thisMonth)->sum('amount'),
                'this_month_count'  => Sale::where('user_id', $userId)->where('sale_date', '>=', $thisMonth)->count(),
                'pending_count'     => Sale::where('user_id', $userId)->pending()->count(),
                'pending_amount'    => Sale::where('user_id', $userId)->pending()->sum('amount'),
                'average_ticket'    => (float) Sale::where('user_id', $userId)->completed()->avg('amount') ?: 0,
            ],
        ]);
    }
}
