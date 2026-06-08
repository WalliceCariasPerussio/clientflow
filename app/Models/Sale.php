<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Sale — representa uma venda associada a um cliente.
 *
 * @property int $id
 * @property int $client_id
 * @property int $user_id
 * @property float $amount
 * @property string|null $description
 * @property string $status      // completed, pending, cancelled
 * @property string $sale_date
 */
class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\SaleFactory> */
    use HasFactory;

    protected $fillable = [
        'client_id',
        'user_id',
        'amount',
        'description',
        'status',
        'sale_date',
    ];

    protected $casts = [
        'amount' => 'float',
        'sale_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}
