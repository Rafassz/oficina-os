import { Router } from 'express';
import { OrdemServico } from '../models/OrdemServico';
import { autenticar } from '../middlewares/auth';
import { STATUS_FINALIZADOS } from '../domain/status-os';

const router = Router();
router.use(autenticar);

router.get('/', async (_req, res) => {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const [porStatus, atrasadas, faturamento, proximasEntregas] = await Promise.all([
    OrdemServico.aggregate<{ _id: string; qtd: number }>([
      { $match: { status: { $nin: STATUS_FINALIZADOS } } },
      { $group: { _id: '$status', qtd: { $sum: 1 } } },
    ]),

    OrdemServico.countDocuments({
      status: { $nin: [...STATUS_FINALIZADOS, 'pronta'] },
      previsaoEntrega: { $lt: agora },
    }),

    // total = soma(qtd * valor) - desconto, calculado no banco
    OrdemServico.aggregate<{ total: number; qtd: number }>([
      { $match: { status: 'entregue', entregueEm: { $gte: inicioMes } } },
      {
        $project: {
          valor: {
            $subtract: [
              {
                $sum: {
                  $map: {
                    input: '$itens',
                    as: 'i',
                    in: { $round: [{ $multiply: ['$$i.quantidade', '$$i.valorUnitario'] }, 0] },
                  },
                },
              },
              { $ifNull: ['$desconto', 0] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$valor' }, qtd: { $sum: 1 } } },
    ]),

    OrdemServico.find({ status: { $nin: STATUS_FINALIZADOS }, previsaoEntrega: { $ne: null } })
      .select('numero status previsaoEntrega veiculo cliente')
      .populate('veiculo', 'placa modelo')
      .populate('cliente', 'nome')
      .sort({ previsaoEntrega: 1 })
      .limit(8),
  ]);

  const fat = faturamento[0] ?? { total: 0, qtd: 0 };

  res.json({
    porStatus: Object.fromEntries(porStatus.map((s) => [s._id, s.qtd])),
    emAberto: porStatus.reduce((acc, s) => acc + s.qtd, 0),
    atrasadas,
    faturamentoMes: fat.total,
    entreguesMes: fat.qtd,
    ticketMedio: fat.qtd ? Math.round(fat.total / fat.qtd) : 0,
    proximasEntregas,
  });
});

export default router;
