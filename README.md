# Atlas das 480 Franquias — Braseira Norte
**Cultura Data-Driven** · Laboratório FNAT · Módulo 3

Dashboard HTML estático, interativo e reproduzível para investigar o case didático **Franchise Clustering** antes de executar clusterização.

## O que pode ser explorado
1. **Visão executiva:** receita, pedidos, ticket médio, delivery, evolução mensal, formatos.
2. **Franquias:** dispersão entre unidades, ranking, comparação, tabela ordenável e exportação CSV.
3. **Perfis descobertos:** cinco grupos validados, perfil econômico, PCA, Silhouette, ARI e as 480 franquias identificadas.
4. **Canais:** composição da receita presencial/delivery por formato e mês.
5. **Ritmo de vendas:** desempenho por dia da semana e mapa de calor por formato.
6. **Promoções:** comparação de médias em dias abertos com e sem promoção, **sem inferência causal**.
7. **Dados e método:** auditoria da fonte, dicionário dos 16 campos e limitações.

### Filtros
Formato físico, porte da cidade, código da franquia, grupo comportamental, mês inicial, mês final e presença de promoção. Os indicadores são recalculados a partir das agregações.

**Exceção:** a página "Promoções" ignora apenas o seletor de promoção para preservar ambos os grupos na comparação. Os demais filtros continuam ativos.

## Fontes
- franquias.csv (480 franquias, 7 campos).
- vendas_diarias.csv (165.280 registros originais, 9 campos).
- Período: 01/10/2023–30/09/2024.
- O site publica agregações por franquia × mês × dia da semana × promoção × aberta, **não os CSVs completos**.

## Reprodutibilidade
Os CSVs originais são preservados na pasta privada do projeto acadêmico, fora deste repositório público. O empacotamento foi gerado por 07_Dashboard_CDD/scripts/gerar_dados_dashboard.py no computador do autor. A auditoria e o dicionário completos estão na mesma pasta local do projeto.

O painel usa Apache ECharts 5.6.0, auto-hospedado, além de HTML/CSS/JavaScript sem back-end. Pode ser aberto diretamente pelo arquivo index.html.

### Fórmulas
- **Receita:** SOMA(faturamento_loja + faturamento_delivery).
- **Ticket médio:** SOMA(receita) / SOMA(pedidos); não é média dos tickets diários.
- **Parcela de delivery:** SOMA(faturamento_delivery) / SOMA(receita).
- **Receita por franquia-dia aberto:** SOMA(receita) / CONTAGEM(aberta=1).
- **Dia fechado:** registro legítimo, não observação ausente; não integra os dias abertos.
- **Diferença promocional:** (média de receita dos dias abertos com promoção / média de receita dos dias abertos sem promoção - 1) × 100. Não estima efeito causal.
- **Franquia nova:** menos de seis meses em 30/09/2024.

## Limitações
Não existem municípios, microdados de clientes, lucro/margem nem identificação de iFood. A clusterização é documentada em um experimento distinto; a otimização financeira, as metas e a oportunidade ainda não foram executadas.

Os dados são do case didático FNAT. A marca Cultura Data-Driven identifica o laboratório, não a autoria dos dados. **Este dashboard não é a entrega final da FNAT.**

## Experimento 001 — Grupos por comportamento
- Cinco clusters (KMeans): G01 120, G02 63, G03 86, G04 93, G05 118 unidades.
- Treino em 440 maduras; 40 novas receberam grupos provisórios.
- Silhueta 0,83019, ARI bootstrap médio 0,99892, benchmark do formato −0,14120.
- Três indicadores padronizados: participação do delivery, participação do fim de semana, ticket médio.
- O arquivo assets/clusters.js publica os resultados de forma agregada e por unidade. Não contém os CSVs originais.
- A classificação é fixa para todo o período histórico; o filtro de grupo modifica as análises das outras páginas sem re-treinar o modelo.


## Experimento 002 — Regras e achados adicionais (12/11/2026)

Dashboard ampliado para nove páginas, com Decisões financeiras e Achados adicionais. Fundo de marketing totalmente reconciliado (R$ 1.440.000): R$ 120.000 de lançamento, R$ 440.000 de piso e R$ 880.000 distribuídos entre as unidades maduras conforme resposta observada à promoção × receita mensal equivalente do grupo. Resultado: 100 maduras aumentam a verba; 340 reduzem; 40 novas mantêm R$ 3.000.

A receita mensal equivalente usa receita observada por franquia / dias corridos observados × 30, preservando dias fechados com zero. Isso equaliza históricos de duração diferente. A oportunidade é teórica: 219 franquias maduras abaixo da mediana do grupo, R$ 1.198.498,10 mensais pelas regras do case. As metas das 440 maduras recebem um fator único para somar incremento de 6% da receita equivalente da rede, assumindo que as 40 novas não acrescentam incremento no cálculo teórico e não recebem meta por pares.

Investigação interna: 34 de 40 novas têm dois blocos completos de 30 dias; evolução mediana pareada de 43,311%, com seis sem janela comparável. Concentração de receita e Gini (0,236). Promoções comparadas de forma bruta e estratificada por franquia e dia da semana; isto não identifica causalidade. Classificações por formato comparadas aos cinco grupos. Nenhuma informação externa ou do iFood foi adicionada. A simulação é fixada no corte de 30/09/2024; filtros de período não recalculam o fundo. Reproduzível pelo Python local 04_Analises/05_decisoes_financeiras_e_insights.py.
