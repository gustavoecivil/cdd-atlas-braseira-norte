# Atlas das 480 Franquias — Braseira Norte
**Cultura Data-Driven** · Laboratório FNAT · Módulo 3

Dashboard HTML estático, interativo e reproduzível para investigar o case didático **Franchise Clustering** antes de executar clusterização.

## O que pode ser explorado
1. **Visão executiva:** receita, pedidos, ticket médio, delivery, evolução mensal, formatos.
2. **Franquias:** dispersão entre unidades, ranking, comparação, tabela ordenável e exportação CSV.
3. **Canais:** composição da receita presencial/delivery por formato e mês.
4. **Ritmo de vendas:** desempenho por dia da semana e mapa de calor por formato.
5. **Promoções:** comparação de médias em dias abertos com e sem promoção, **sem inferência causal**.
6. **Dados e método:** auditoria da fonte, dicionário dos 16 campos e limitações.

### Filtros
Formato físico, porte da cidade, código da franquia, mês inicial, mês final e presença de promoção. Os indicadores são recalculados a partir das agregações.

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
Não existem municípios, microdados de clientes, lucro/margem nem identificação de iFood. Não são calculados clusters, Silhouette, ARI, otimização de verbas ou metas nesta versão.

Os dados são do case didático FNAT. A marca Cultura Data-Driven identifica o laboratório, não a autoria dos dados. **Este dashboard não é a entrega final da FNAT.**