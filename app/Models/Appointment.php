<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'client_id', 'title', 'description', 'date', 'time', 'status'];
    protected $casts = ['date' => 'date'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }

    public function scopeScheduled($query) { return $query->where('status', 'scheduled'); }
    public function scopeCompleted($query) { return $query->where('status', 'completed'); }
}
