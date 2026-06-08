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
 * @property int|null $company_id
 * @property string $status       // active, inactive, lead
 * @property string|null $notes
 * @property int $user_id
 */
#[Fillable(['name', 'email', 'phone', 'company_id', 'status', 'notes', 'user_id'])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function sales(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeLead($query)
    {
        return $query->where('status', 'lead');
    }
}
