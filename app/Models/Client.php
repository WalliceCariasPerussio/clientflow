<?php

namespace App\Models;

use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo Client — representa um cliente no portfólio ClientFlow.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $company
 * @property string $status       // active, inactive, lead
 * @property string|null $notes
 * @property int $user_id
 */
#[Fillable(['name', 'email', 'phone', 'company', 'status', 'notes', 'user_id'])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    /**
     * Relacionamento: cada cliente pertence a um usuário (vendedor).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: filtra clientes ativos.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: filtra clientes inativos.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope: filtra leads.
     */
    public function scopeLead($query)
    {
        return $query->where('status', 'lead');
    }
}
