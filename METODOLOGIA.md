# Metodologia e Proveniência — Braseira Norte

## Objetivo
Dashboard descritivo para compreender as características de 480 franquias e seu movimento antes da modelagem de clusters do case Franchise Clustering (FNAT).

## Granularidade
Fontes originais: uma franquia por linha no cadastro; uma franquia por data no diário. Dados de publicação agregados por franquia × mês × dia-da-semana × indicador de promoção × indicador de aberta.

O dashboard usa 66.480 combinações agregadas para preservar somatórios e filtros sem publicar os CSVs brutos no GitHub.

## Validação inicial
- 480 IDs únicos e 165.280 registros de franquia-dia.
- 0 pares franquia-data duplicados, 0 vendas órfãs, 0 datas anteriores à abertura, 0 lacunas após a inauguração.
- 4 valores ausentes na distância ao concorrente, sem imputação.
- 6.654 dias fechados com receita zero.
- 1.038 marcações de promoção em dias fechados.
- 40 franquias com menos de 6 meses em 30/09/2024.

## Métricas
Receita = loja + delivery; ticket = receita/pedidos; participação delivery = receita delivery/receita; receita por dia aberto = receita/dias abertos.

Promoções: comparações observacionais apenas entre dias abertos. Campanha não é alocada aleatoriamente, então não se estima causalidade.

## Transparência
O case não permite localizar municípios nem atribuir receita ao iFood; não se inferem custos, margens, CAC ou recorrência de clientes. Os clusters foram calculados em experimento posterior. A alocação orçamentária e as metas permanecem pendentes.

Os CSVs oficiais permanecem intactos na pasta do projeto. O painel é apenas uma etapa de exploração.

## Experimento 001 — Clusters de operação
- Treino em 440 franquias maduras, usando StandardScaler e KMeans com random_state=42, n_init=30.
- Variáveis: share_delivery, share_fimsemana e ticket. Faturamento absoluto e formato ficam fora do ajuste.
- Comparações: k=2 a 8, silhueta no mesmo espaço; estabilidade por reamostragem e ARI.
- Número escolhido k=5; silhueta 0,83019; ARI bootstrap médio 0,99892; formato físico com silhueta −0,14120.
- 40 novas não treinam o modelo: grupo provisório pela proximidade de centróides.
- O agrupamento depende da população e das variáveis definidas; os dados são didáticos e não comprovam comportamento futuro.


## Experimento 002 — Regras e achados adicionais (12/11/2026)

Dashboard ampliado para nove páginas, com Decisões financeiras e Achados adicionais. Fundo de marketing totalmente reconciliado (R$ 1.440.000): R$ 120.000 de lançamento, R$ 440.000 de piso e R$ 880.000 distribuídos entre as unidades maduras conforme resposta observada à promoção × receita mensal equivalente do grupo. Resultado: 100 maduras aumentam a verba; 340 reduzem; 40 novas mantêm R$ 3.000.

A receita mensal equivalente usa receita observada por franquia / dias corridos observados × 30, preservando dias fechados com zero. Isso equaliza históricos de duração diferente. A oportunidade é teórica: 219 franquias maduras abaixo da mediana do grupo, R$ 1.198.498,10 mensais pelas regras do case. As metas das 440 maduras recebem um fator único para somar incremento de 6% da receita equivalente da rede, assumindo que as 40 novas não acrescentam incremento no cálculo teórico e não recebem meta por pares.

Investigação interna: 34 de 40 novas têm dois blocos completos de 30 dias; evolução mediana pareada de 43,311%, com seis sem janela comparável. Concentração de receita e Gini (0,236). Promoções comparadas de forma bruta e estratificada por franquia e dia da semana; isto não identifica causalidade. Classificações por formato comparadas aos cinco grupos. Nenhuma informação externa ou do iFood foi adicionada. A simulação é fixada no corte de 30/09/2024; filtros de período não recalculam o fundo. Reproduzível pelo Python local 04_Analises/05_decisoes_financeiras_e_insights.py.
