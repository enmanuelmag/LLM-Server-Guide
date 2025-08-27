// Test script to verify dotenv is working correctly
import { config } from '../config/index';

console.log('🔧 Testing dotenv configuration...\n');

console.log('📋 Environment Variables Status:');
console.log('================================');

// Test OpenAI API Key
if (config.openai.apiKey && config.openai.apiKey !== '') {
  console.log('✅ OPENAI_API_KEY: Loaded successfully');
  console.log(`   Length: ${config.openai.apiKey.length} characters`);
  console.log(`   Preview: ${config.openai.apiKey.substring(0, 7)}...${config.openai.apiKey.substring(config.openai.apiKey.length - 4)}`);
} else {
  console.log('❌ OPENAI_API_KEY: Not found or empty');
  console.log('   Make sure to create a .env file with OPENAI_API_KEY=your_key_here');
}

// Test Server Config
console.log(`✅ PORT: ${config.server.port}`);
console.log(`✅ NODE_ENV: ${config.server.nodeEnv}`);

// Test OpenAI Models
console.log(`✅ OpenAI Model: ${config.openai.model}`);
console.log(`✅ Embedding Model: ${config.openai.embeddingModel}`);

console.log('\n📝 Instructions:');
console.log('================');
console.log('1. Copy .env.example to .env');
console.log('2. Add your OpenAI API key to .env');
console.log('3. Run: npm run test:env');
console.log('\n🎯 If OPENAI_API_KEY shows as loaded, dotenv is working correctly!');
