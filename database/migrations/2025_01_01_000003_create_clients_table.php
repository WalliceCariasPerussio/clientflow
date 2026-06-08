<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa as migrações.
     * Cria a tabela de clientes do portfólio ClientFlow.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');                         // Nome do cliente
            $table->string('email')->unique();              // Email do cliente
            $table->string('phone')->nullable();            // Telefone do cliente
            $table->string('company')->nullable();          // Empresa do cliente
            $table->enum('status', ['active', 'inactive', 'lead'])
                  ->default('lead');                         // Status: ativo, inativo ou lead
            $table->text('notes')->nullable();              // Observações sobre o cliente
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();                      // Dono do cliente (vendedor)
            $table->timestamps();
        });
    }

    /**
     * Reverte as migrações.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
