const db = require('./src/db');

async function testarCRUD() {
  try {
    console.log('🧪 Iniciando testes CRUD...\n');
    
    // ==================== TESTE CREATE ====================
    console.log('➕ TESTE CREATE - Inserindo dados...');
    
    // Inserir uma pessoa
    const pessoaResult = await db.query(
      'INSERT INTO pessoas (tipo, razaosocial, fantasia, documento) VALUES ($1, $2, $3, $4) RETURNING *',
      ['FORNECEDOR', 'Tech Solutions Ltda', 'TechSol', '12345678000190']
    );
    const pessoaId = pessoaResult.rows[0].id;
    console.log('✅ Pessoa inserida:', pessoaResult.rows[0]);
    
    // Inserir uma classificação
    const classResult = await db.query(
      'INSERT INTO classificacoes (tipo, descricao) VALUES ($1, $2) RETURNING *',
      ['DESPESA', 'Tecnologia e Informática']
    );
    const classId = classResult.rows[0].id;
    console.log('✅ Classificação inserida:', classResult.rows[0]);
    
    // Inserir um movimento
    const movResult = await db.query(
      'INSERT INTO movimentos (tipo, numero_notafiscal, data_emissao, descricao, valor_total, id_fornecedorcliente) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      ['DESPESA', 'NF-2025-001', '2025-11-07', 'Compra de equipamentos', 5000.00, pessoaId]
    );
    const movId = movResult.rows[0].id;
    console.log('✅ Movimento inserido:', movResult.rows[0]);
    
    // Inserir parcela
    const parcelaResult = await db.query(
      'INSERT INTO parcelas (id_movimento, identificacao, data_vencimento, valor_parcela, valor_saldo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [movId, 'Parcela Única', '2025-12-07', 5000.00, 5000.00]
    );
    console.log('✅ Parcela inserida:', parcelaResult.rows[0]);
    
    // Relacionar movimento com classificação
    await db.query(
      'INSERT INTO movimento_classificacao (id_movimento, id_classificacao) VALUES ($1, $2)',
      [movId, classId]
    );
    console.log('✅ Relacionamento movimento-classificação criado\n');
    
    // ==================== TESTE READ ====================
    console.log('🔍 TESTE READ - Consultando dados...');
    
    // Listar todas as pessoas
    const pessoas = await db.query('SELECT * FROM pessoas');
    console.log('📋 Pessoas cadastradas:', pessoas.rows);
    
    // Listar movimentos com detalhes
    const movimentos = await db.query(`
      SELECT m.*, p.razaosocial as fornecedor, c.descricao as classificacao
      FROM movimentos m
      LEFT JOIN pessoas p ON m.id_fornecedorcliente = p.id
      LEFT JOIN movimento_classificacao mc ON m.id = mc.id_movimento
      LEFT JOIN classificacoes c ON mc.id_classificacao = c.id
    `);
    console.log('📊 Movimentos com detalhes:', movimentos.rows);
    
    // ==================== TESTE UPDATE ====================
    console.log('\n✏️ TESTE UPDATE - Atualizando dados...');
    
    // Atualizar pessoa
    const updateResult = await db.query(
      'UPDATE pessoas SET fantasia = $1 WHERE id = $2 RETURNING *',
      ['TechSol Brasil', pessoaId]
    );
    console.log('✅ Pessoa atualizada:', updateResult.rows[0]);
    
    // ==================== TESTE DELETE ====================
    console.log('\n🗑️ TESTE DELETE - Excluindo dados...');
    
    // Excluir parcela (para demonstrar delete)
    await db.query('DELETE FROM parcelas WHERE id_movimento = $1', [movId]);
    console.log('✅ Parcela excluída');
    
    // Excluir movimento (cascade com parcelas já deletadas)
    await db.query('DELETE FROM movimento_classificacao WHERE id_movimento = $1', [movId]);
    await db.query('DELETE FROM movimentos WHERE id = $1', [movId]);
    console.log('✅ Movimento excluído');
    
    // Verificar dados finais
    console.log('\n📈 Dados finais:');
    const finalPessoas = await db.query('SELECT COUNT(*) as total FROM pessoas');
    const finalMovimentos = await db.query('SELECT COUNT(*) as total FROM movimentos');
    const finalParcelas = await db.query('SELECT COUNT(*) as total FROM parcelas');
    
    console.log(`👥 Pessoas: ${finalPessoas.rows[0].total}`);
    console.log(`📄 Movimentos: ${finalMovimentos.rows[0].total}`);
    console.log(`💰 Parcelas: ${finalParcelas.rows[0].total}`);
    
    console.log('\n🎉 Testes CRUD concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    process.exit(0);
  }
}

testarCRUD();