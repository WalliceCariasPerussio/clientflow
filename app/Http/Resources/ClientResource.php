<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Recurso API para o modelo Client.
 * Controla a serialização dos dados do cliente na API.
 */
class ClientResource extends JsonResource
{
    /**
     * Transforma o recurso em um array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'company'    => $this->company,
            'status'     => $this->status,
            'notes'      => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Inclui o dono do cliente quando o relacionamento está carregado
            'user'       => new UserResource($this->whenLoaded('user')),
        ];
    }
}
