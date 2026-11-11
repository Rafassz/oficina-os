/**
 * Popula o banco com dados de exemplo para demonstração.
 *   npm run seed            -> só cria se o banco estiver vazio
 *   npm run seed -- --limpar -> apaga tudo e recria
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { conectarBanco } from './db';
import { Usuario } from './models/Usuario';
import { Cliente } from './models/Cliente';
import { Veiculo } from './models/Veiculo';
import { OrdemServico } from './models/OrdemServico';
import { ajustarContador } from './models/Contador';
import type { StatusOS } from './domain/status-os';

const SENHA_PADRAO = 'oficina123';

const diasAtras = (d: number) => new Date(Date.now() - d * 86_400_000);
const reais = (v: number) => Math.round(v * 100);

async function main() {
  await conectarBanco();
  const limpar = process.argv.includes('--limpar');

  if (limpar) {
    await mongoose.connection.dropDatabase();
    console.log('[seed] banco apagado');
  } else if (await Usuario.exists({})) {
    console.log('[seed] já existem dados. Use "npm run seed -- --limpar" para recriar.');
    return;
  }

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
  const [admin, carlos, rogerio] = await Usuario.create([
    { nome: 'Marcos Prado', email: 'admin@oficina.local', senhaHash, papel: 'admin' },
    { nome: 'Carlos Henrique', email: 'carlos@oficina.local', senhaHash, papel: 'mecanico' },
    { nome: 'Rogério Lima', email: 'rogerio@oficina.local', senhaHash, papel: 'mecanico' },
  ]);

  const clientes = await Cliente.create([
    { nome: 'Juliana Ferreira Costa', telefone: '11987451230', documento: '32165498700' },
    { nome: 'Antônio Batista', telefone: '11976543210', observacoes: 'Prefere contato por WhatsApp depois das 18h' },
    { nome: 'Padaria Santa Rita Ltda', telefone: '1155214477', documento: '12345678000190' },
    { nome: 'Renata Okumura', telefone: '11991237788' },
    { nome: 'Edson Moreira', telefone: '11968880021' },
  ]);

  const [gol, onix, strada, hb20, corolla, uno] = await Veiculo.create([
    { cliente: clientes[0]._id, placa: 'FJK3A21', marca: 'Volkswagen', modelo: 'Gol 1.0', ano: 2017, cor: 'Prata', km: 98_420 },
    { cliente: clientes[1]._id, placa: 'EZP4410', marca: 'Chevrolet', modelo: 'Onix LT 1.4', ano: 2015, cor: 'Branco', km: 131_000 },
    { cliente: clientes[2]._id, placa: 'GHT7C55', marca: 'Fiat', modelo: 'Strada Working', ano: 2020, cor: 'Branco', km: 76_310 },
    { cliente: clientes[3]._id, placa: 'QWE2B19', marca: 'Hyundai', modelo: 'HB20 Comfort', ano: 2019, cor: 'Vermelho', km: 54_900 },
    { cliente: clientes[4]._id, placa: 'DKM9081', marca: 'Toyota', modelo: 'Corolla XEi 2.0', ano: 2014, cor: 'Preto', km: 162_750 },
    { cliente: clientes[2]._id, placa: 'BRA2E19', marca: 'Fiat', modelo: 'Uno Way', ano: 2016, cor: 'Cinza', km: 110_200 },
  ]);

  type ItemSeed = { tipo: 'peca' | 'servico'; descricao: string; quantidade: number; valorUnitario: number };
  type OsSeed = {
    veiculo: typeof gol;
    status: StatusOS;
    relato: string;
    diagnostico?: string;
    itens: ItemSeed[];
    abertaHa: number;
    previsao?: number; // dias a partir de hoje (negativo = atrasada)
    mecanico?: typeof carlos;
    desconto?: number;
  };

  const ordens: OsSeed[] = [
    {
      veiculo: corolla,
      status: 'entregue',
      relato: 'Revisão dos 160 mil e barulho na suspensão dianteira',
      diagnostico: 'Bieletas com folga dos dois lados. Óleo e filtros vencidos.',
      itens: [
        { tipo: 'peca', descricao: 'Óleo 5W30 sintético (L)', quantidade: 4.5, valorUnitario: reais(52) },
        { tipo: 'peca', descricao: 'Filtro de óleo', quantidade: 1, valorUnitario: reais(38) },
        { tipo: 'peca', descricao: 'Filtro de ar do motor', quantidade: 1, valorUnitario: reais(64.9) },
        { tipo: 'peca', descricao: 'Bieleta dianteira', quantidade: 2, valorUnitario: reais(89) },
        { tipo: 'servico', descricao: 'Troca de óleo e filtros', quantidade: 1, valorUnitario: reais(60) },
        { tipo: 'servico', descricao: 'Substituição das bieletas', quantidade: 1, valorUnitario: reais(120) },
      ],
      abertaHa: 9,
      mecanico: carlos,
      desconto: reais(30),
    },
    {
      veiculo: onix,
      status: 'entregue',
      relato: 'Luz da injeção acesa e motor falhando em marcha lenta',
      diagnostico: 'Bobina do cilindro 3 queimada, velas desgastadas.',
      itens: [
        { tipo: 'peca', descricao: 'Bobina de ignição', quantidade: 1, valorUnitario: reais(289) },
        { tipo: 'peca', descricao: 'Jogo de velas', quantidade: 1, valorUnitario: reais(96) },
        { tipo: 'servico', descricao: 'Diagnóstico com scanner', quantidade: 1, valorUnitario: reais(80) },
        { tipo: 'servico', descricao: 'Troca de bobina e velas', quantidade: 1, valorUnitario: reais(90) },
      ],
      abertaHa: 4,
      mecanico: rogerio,
    },
    {
      veiculo: strada,
      status: 'em_execucao',
      relato: 'Pedal de freio baixo, chiado ao frear',
      diagnostico: 'Pastilhas no limite e disco dianteiro empenado.',
      itens: [
        { tipo: 'peca', descricao: 'Jogo de pastilhas dianteiras', quantidade: 1, valorUnitario: reais(145) },
        { tipo: 'peca', descricao: 'Disco de freio dianteiro', quantidade: 2, valorUnitario: reais(178) },
        { tipo: 'peca', descricao: 'Fluido de freio DOT 4 (500ml)', quantidade: 1, valorUnitario: reais(32) },
        { tipo: 'servico', descricao: 'Troca de discos e pastilhas', quantidade: 1, valorUnitario: reais(150) },
        { tipo: 'servico', descricao: 'Sangria do sistema de freio', quantidade: 1, valorUnitario: reais(50) },
      ],
      abertaHa: 2,
      previsao: 1,
      mecanico: carlos,
    },
    {
      veiculo: hb20,
      status: 'aguardando_peca',
      relato: 'Ar-condicionado não gela',
      diagnostico: 'Compressor travado. Peça encomendada no distribuidor, prazo de 3 dias.',
      itens: [
        { tipo: 'peca', descricao: 'Compressor do ar-condicionado', quantidade: 1, valorUnitario: reais(1450) },
        { tipo: 'peca', descricao: 'Gás R134a + óleo PAG', quantidade: 1, valorUnitario: reais(180) },
        { tipo: 'servico', descricao: 'Troca do compressor e carga de gás', quantidade: 1, valorUnitario: reais(350) },
      ],
      abertaHa: 6,
      previsao: -1,
      mecanico: rogerio,
    },
    {
      veiculo: gol,
      status: 'orcamento',
      relato: 'Carro esquentando no trânsito, ventoinha parece não ligar',
      itens: [],
      abertaHa: 0,
      previsao: 2,
    },
    {
      veiculo: uno,
      status: 'pronta',
      relato: 'Troca de correia dentada (preventiva)',
      diagnostico: 'Correia e tensor originais com 110 mil km. Substituídos conforme manual.',
      itens: [
        { tipo: 'peca', descricao: 'Kit correia dentada + tensor', quantidade: 1, valorUnitario: reais(320) },
        { tipo: 'peca', descricao: 'Bomba d\'água', quantidade: 1, valorUnitario: reais(165) },
        { tipo: 'servico', descricao: 'Substituição da correia dentada', quantidade: 1, valorUnitario: reais(280) },
      ],
      abertaHa: 3,
      previsao: 0,
      mecanico: carlos,
    },
  ];

  // Caminho de status que cada OS percorreu até chegar onde está
  const caminho: Record<StatusOS, StatusOS[]> = {
    orcamento: ['orcamento'],
    aprovada: ['orcamento', 'aprovada'],
    em_execucao: ['orcamento', 'aprovada', 'em_execucao'],
    aguardando_peca: ['orcamento', 'aprovada', 'em_execucao', 'aguardando_peca'],
    pronta: ['orcamento', 'aprovada', 'em_execucao', 'pronta'],
    entregue: ['orcamento', 'aprovada', 'em_execucao', 'pronta', 'entregue'],
    cancelada: ['orcamento', 'cancelada'],
  };

  let numero = 1040; // a oficina já existia antes do sistema :)
  for (const os of ordens) {
    numero += 1;
    const passos = caminho[os.status];
    const historico = passos.map((status, i) => ({
      status,
      em: new Date(diasAtras(os.abertaHa).getTime() + i * 5 * 3_600_000),
      por: i === 0 ? admin._id : (os.mecanico ?? admin)._id,
      obs: i === 0 ? 'Veículo recebido' : undefined,
    }));
    const ultimo = historico[historico.length - 1];

    await OrdemServico.create({
      numero,
      cliente: os.veiculo.cliente,
      veiculo: os.veiculo._id,
      mecanico: os.mecanico?._id ?? null,
      status: os.status,
      kmEntrada: os.veiculo.km,
      relato: os.relato,
      diagnostico: os.diagnostico ?? '',
      itens: os.itens,
      desconto: os.desconto ?? 0,
      previsaoEntrega: os.previsao !== undefined ? diasAtras(-os.previsao) : null,
      entregueEm: os.status === 'entregue' ? ultimo.em : null,
      historico,
      createdAt: historico[0].em,
    });
  }
  await ajustarContador('os', numero);

  console.log(`[seed] ok — ${ordens.length} OS, ${clientes.length} clientes`);
  console.log(`[seed] login: admin@oficina.local / ${SENHA_PADRAO}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
