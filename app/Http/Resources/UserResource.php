<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Recurso API para o modelo User.
 * Controla a serialização dos dados do usuário na API.
 */
class UserResource extends JsonResource
{
    /**
     * Transforma o recurso em um array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'email'           => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}
