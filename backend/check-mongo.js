// Este script verifica se o MongoDB está disponível antes de iniciar a aplicação
require('dotenv').config(); 
const { MongoClient } = require('mongodb');

async function checkMongo() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL não definida no ambiente');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // 5 segundos timeout para seleção de servidor
    connectTimeoutMS: 10000,        // 10 segundos timeout para conexão
  });
  
  try {
    console.log('Verificando conexão com MongoDB...');
    
    // Conectar ao MongoDB
    await client.connect();
    console.log('Conexão estabelecida com MongoDB');
    
    // Verificar ping
    const admin = client.db('admin');
    const pingResult = await admin.command({ ping: 1 });
    
    if (pingResult.ok === 1) {
      console.log('Ping ao MongoDB bem-sucedido!');
      
      // Verificar se podemos acessar o banco de dados da aplicação
      const appDb = client.db('cinbora_db');
      await appDb.command({ dbStats: 1 });
      console.log('Banco de dados da aplicação acessível');
      
      process.exit(0);
    } else {
      console.error('Falha no comando ping do MongoDB');
      process.exit(1);
    }
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('Não foi possível selecionar um servidor MongoDB. Verifique se o servidor está em execução.');
    }
    process.exit(1);
  } finally {
    try {
      await client.close();
    } catch (err) {
      console.error('Erro ao fechar conexão MongoDB:', err.message);
    }
  }
}

// Executar a verificação
checkMongo();