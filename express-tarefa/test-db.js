const db = require('./src/db');

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com o banco de dados...');
    
    // Testar conexão simples
    const result = await db.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📅 Hora do servidor:', result.rows[0].now);
    
    // Verificar se as tabelas existem
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    if (tables.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. As tabelas precisam ser criadas.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();