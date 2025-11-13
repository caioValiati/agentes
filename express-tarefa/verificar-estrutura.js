const db = require('./src/db');

async function verificarEstrutura() {
  try {
    console.log('📋 Verificando estrutura das tabelas...\n');
    
    // Verificar estrutura de cada tabela
    const tabelas = ['pessoas', 'classificacoes', 'movimentos', 'parcelas', 'movimento_classificacao'];
    
    for (const tabela of tabelas) {
      console.log(`📊 Tabela: ${tabela}`);
      const estrutura = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tabela]);
      
      estrutura.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Contar registros
      const count = await db.query(`SELECT COUNT(*) as total FROM ${tabela}`);
      console.log(`  📊 Total de registros: ${count.rows[0].total}\n`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
  } finally {
    process.exit(0);
  }
}

verificarEstrutura();