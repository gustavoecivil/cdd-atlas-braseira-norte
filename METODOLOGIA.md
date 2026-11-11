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
O case não permite localizar municípios nem atribuir receita ao iFood; não se inferem custos, margens, CAC ou recorrência de clientes. Os clusters e as regras orçamentárias ainda não foram executados.

Os CSVs oficiais permanecem intactos na pasta do projeto. O painel é apenas uma etapa de exploração.