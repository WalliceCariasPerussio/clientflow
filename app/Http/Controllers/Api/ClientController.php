<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller de Clientes da API.
 *
 * CRUD completo para gestão de clientes do portfólio ClientFlow.
 * Todos os endpoints exigem autenticação via Sanctum.
 */
class ClientController extends Controller
{
    /**
     * Lista todos os clientes do usuário autenticado.
     * Suporta paginação e filtro por status.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $clients = Client::with('company')->where('user_id', $request->user()->id)
            ->when($request->status, function ($query, $status) {
                // Filtra por status se o parâmetro for informado
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15);

        return ClientResource::collection($clients);
    }

    /**
     * Cria um novo cliente vinculado ao usuário autenticado.
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        // Cria o cliente com os dados validados + user_id do token
        $client = Client::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return (new ClientResource($client))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Exibe os detalhes de um cliente específico.
     * Apenas o dono do cliente pode visualizá-lo.
     */
    public function show(Client $client): ClientResource
    {
        // Verifica se o cliente pertence ao usuário autenticado
        $this->authorize('view', $client);

        return new ClientResource($client->load('user'));
    }

    /**
     * Atualiza os dados de um cliente.
     * Apenas o dono do cliente pode editá-lo.
     */
    public function update(UpdateClientRequest $request, Client $client): ClientResource
    {
        // Verifica se o cliente pertence ao usuário autenticado
        $this->authorize('update', $client);

        $client->update($request->validated());

        return new ClientResource($client);
    }

    /**
     * Remove um cliente do sistema.
     * Apenas o dono do cliente pode excluí-lo.
     */
    public function destroy(Client $client): JsonResponse
    {
        // Verifica se o cliente pertence ao usuário autenticado
        $this->authorize('delete', $client);

        $client->delete();

        return response()->json([
            'message' => 'Cliente removido com sucesso.',
        ]);
    }

    /**
     * Exporta os clientes do usuário como CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $clients = Client::where('user_id', $request->user()->id)
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="clientes.csv"',
        ];

        return response()->stream(function () use ($clients) {
            $handle = fopen('php://output', 'w');
            // BOM para Excel reconhecer UTF-8
            fwrite($handle, "\xEF\xBB\xBF");

            // Cabeçalho
            fputcsv($handle, ['Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Observações', 'Criado em']);

            foreach ($clients as $client) {
                $statusMap = ['active' => 'Ativo', 'inactive' => 'Inativo', 'lead' => 'Lead'];
                fputcsv($handle, [
                    $client->name,
                    $client->email,
                    $client->phone ?? '',
                    $client->company?->name ?? '',
                    $statusMap[$client->status] ?? $client->status,
                    $client->notes ?? '',
                    $client->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Retorna os 5 clientes mais recentes do usuário.
     */
    public function recent(Request $request): AnonymousResourceCollection
    {
        $clients = Client::with('company')->where('user_id', $request->user()->id)
            ->latest()
            ->limit(5)
            ->get();

        return ClientResource::collection($clients);
    }
}
