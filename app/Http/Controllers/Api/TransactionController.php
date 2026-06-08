<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $transactions = Transaction::where('user_id', $userId)
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->search, fn($q) => $q->where('description', 'like', "%{$request->search}%"))
            ->orderByDesc('date')
            ->paginate($request->per_page ?? 15);

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'        => 'required|in:income,expense',
            'amount'      => 'required|numeric|min:0',
            'description' => 'required|string|max:500',
            'category'    => 'nullable|string|max:100',
            'date'        => 'required|date',
        ]);
        $data['user_id'] = $request->user()->id;
        return response()->json(Transaction::create($data), 201);
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) return response()->json(['message' => 'Not found.'], 404);
        $data = $request->validate([
            'type'        => 'sometimes|in:income,expense',
            'amount'      => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string|max:500',
            'category'    => 'nullable|string|max:100',
            'date'        => 'sometimes|date',
        ]);
        $transaction->update($data);
        return response()->json($transaction);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) return response()->json(['message' => 'Not found.'], 404);
        $transaction->delete();
        return response()->json(null, 204);
    }

    public function balance(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $income = Transaction::where('user_id', $userId)->income()->sum('amount');
        $expense = Transaction::where('user_id', $userId)->expense()->sum('amount');
        $thisMonthIncome = Transaction::where('user_id', $userId)->income()->where('date', '>=', now()->startOfMonth())->sum('amount');
        $thisMonthExpense = Transaction::where('user_id', $userId)->expense()->where('date', '>=', now()->startOfMonth())->sum('amount');

        return response()->json(['data' => [
            'total_income'       => (float) $income,
            'total_expense'      => (float) $expense,
            'balance'            => (float) ($income - $expense),
            'this_month_income'  => (float) $thisMonthIncome,
            'this_month_expense' => (float) $thisMonthExpense,
        ]]);
    }
}
