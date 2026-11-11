import { criarApp } from './app';
import { conectarBanco } from './db';
import { env } from './config/env';

async function iniciar() {
  try {
    await conectarBanco();
  } catch (err) {
    console.error(`[db] não consegui conectar em ${env.mongoUri}. O MongoDB está rodando?`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  criarApp().listen(env.porta, () => {
    console.log(`[api] ouvindo em http://localhost:${env.porta}`);
  });
}

iniciar();
