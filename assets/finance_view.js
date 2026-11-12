"use strict";
const FC={"G01":"#b58b55","G02":"#a45146","G03":"#658b78","G04":"#648a9b","G05":"#6c5b8b"};
const finPct=x=>Number.isFinite(x)?nf(x,1)+"%":"—";
let fLimit=50;
function financeTable(){
 let s0=$("financeSearch").value.toLowerCase();
 let list=FIN.franquias.filter(u=>(s.grupo==="todos"||u.grupo===s.grupo)&&(s.franquia==="todos"||u.franquia===s.franquia)&&
 (u.franquia+" "+u.grupo+" "+u.acao).toLowerCase().includes(s0));
 list.sort((a,b)=>a.grupo.localeCompare(b.grupo)||a.franquia.localeCompare(b.franquia));
 $("financeTable").querySelector("tbody").innerHTML=list.slice(0,fLimit).map(u=>`<tr data-id="${u.franquia}">
 <td><b style="color:#9c7441">${u.franquia}</b></td><td><b style="color:${FC[u.grupo]}">${u.grupo}</b></td>
 <td>${u.nova?"Nova · lançamento":"Madura"}</td><td>${real(u.receita_mes_equiv_reais)}</td>
 <td><b>${real(u.verba_reais)}</b></td><td class="${u.delta_verba_reais>0?"gain":"loss"}">${u.delta_verba_reais>0?"+":""}${real(u.delta_verba_reais)}</td>
 <td>${u.acao}</td><td>${u.nova?"—":real(u.oportunidade_mes_reais)}</td>
 <td>${u.nova?"Sem meta":finPct(u.meta_ano_pct)}</td></tr>`).join("");
 $("finCount").textContent="Exibindo "+nf(Math.min(fLimit,list.length))+" de "+nf(list.length)+" unidades";
 $("moreFinanceRows").style.display=fLimit>=list.length?"none":"inline-flex";
 $("financeTable").querySelectorAll("tbody tr").forEach(tr=>tr.addEventListener("click",()=>{
 let id=tr.dataset.id;s.franquia=id;s.grupo="todos";$("sel-franquia").value=id;$("sel-grupo").value="todos";showPage("franquias");toast(id+" selecionada");}));
 if(!$("financeSearch").dataset.bound){
  $("financeSearch").dataset.bound="1";
  $("financeSearch").addEventListener("input",()=>{fLimit=50;financeTable()});
  $("moreFinanceRows").addEventListener("click",()=>{fLimit+=50;financeTable()});
  $("exportFinance").addEventListener("click",()=>{
   let cols=["franquia","grupo","nova","receita_mes_equiv_reais","verba_reais","delta_verba_reais","acao","oportunidade_mes_reais","meta_ano_pct"];
   let csv=[cols.join(";"),...list.map(u=>cols.map(k=>u[k]===null?"":String(u[k]).replace(".",",")).join(";"))].join("\r\n");
   let url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
   let l=document.createElement("a");l.href=url;l.download="CDD_BraseiraNorte_Financeiro.csv";l.click();setTimeout(()=>URL.revokeObjectURL(url),700);toast("Planilha financeira exportada");
  });
 }
}
function renderFinanceiro(){
 let f=FIN.resumo,g=FIN.grupos,ids=g.map(p=>p.grupo);
 kpis("financeKpis",[
  ["FUNDO TOTAL",short(f.fundo_reais),"100% conciliado"],
  ["PARCELA VARIÁVEL",short(f.fundo_discricionario_reais),"Após reservas e piso"],
  ["UNIDADES COM AUMENTO",nf(f.acoes_total.aumentar),nf(f.acoes_total.reduzir)+" recebem redução"],
  ["OPORTUNIDADE/MÊS",short(f.oportunidade_total_mes_reais),nf(f.franquias_abaixo_da_mediana)+" abaixo da mediana"]]);
 $("financeRecon").innerHTML=[
  ["LANÇAMENTO · 40 NOVAS",f.fundo_lancamento_reais,"R$ 3.000 por nova unidade"],
  ["PISO · 440 MADURAS",f.piso_maduras_reais,"R$ 1.000 por madura"],
  ["REPARTIÇÃO VARIÁVEL",f.fundo_discricionario_reais,"Conforme resposta promocional e receita"],
  ["TOTAL RECONCILIADO",f.orcamento_total_alocado_reais,"Reserva + piso + variável"]
 ].map(x=>`<div class="recon-item"><span class="label">${x[0]}</span><strong class="val">${short(x[1])}</strong><div class="sub">${x[2]}</div></div>`).join("");
 plot("chart-fin-fund",{grid:{left:53,right:85,top:35,bottom:58},legend:{bottom:0,textStyle:{fontSize:11}},
 xAxis:{...values,axisLabel:{formatter:x=>nf(x/1000,0)+" mil"}},yAxis:{...category,inverse:true,data:ids},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:it=>it[0].axisValue+"<br/>"+it.map(x=>x.seriesName+": "+real(x.value)).join("<br/>")},
 series:[{name:"Piso",type:"bar",stack:"total",barMaxWidth:29,data:g.map(x=>x.verba_piso_maduras_reais),itemStyle:{color:COLORS.ink}},
 {name:"Variável",type:"bar",stack:"total",barMaxWidth:29,data:g.map(x=>x.pool_discricionario_reais),itemStyle:{color:COLORS.gold}},
 {name:"Lançamento",type:"bar",stack:"total",barMaxWidth:29,data:g.map(x=>x.verba_lancamento_reais),itemStyle:{color:COLORS.green},
 label:{show:true,position:"right",formatter:it=>short(g[it.dataIndex].verba_total_reais),fontSize:10,color:COLORS.ink,fontWeight:800}}]});
 plot("chart-fin-before",{grid:{left:63,right:65,top:31,bottom:58},legend:{bottom:0,textStyle:{fontSize:11}},
 xAxis:{...values,min:0,max:6900,axisLabel:{formatter:x=>nf(x/1000,0)+" mil"}},yAxis:{...category,inverse:true,data:ids},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:it=>it[0].axisValue+"<br/>"+it.map(x=>x.seriesName+": "+real(x.value)).join("<br/>")},
 series:[{name:"Antes",type:"bar",barWidth:16,data:g.map(()=>3000),itemStyle:{color:"#c9c5bd"}},
 {name:"Depois",type:"bar",barWidth:19,data:g.map(x=>({value:x.verba_media_madura_reais,itemStyle:{color:FC[x.grupo]}})),
 label:{show:true,position:"right",formatter:it=>short(it.value),fontSize:10,fontWeight:800,color:COLORS.ink}}]});
 plot("chart-fin-opportunity",{grid:{left:60,right:89,top:28,bottom:32},
 xAxis:{...values,axisLabel:{formatter:x=>nf(x/1000,0)+" mil"}},yAxis:{...category,inverse:true,data:ids},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+"<br/>"+real(x.value)+"<br/>"+nf(g[x.dataIndex].abaixo_mediana)+" unidades abaixo da mediana"},
 series:[{type:"bar",barMaxWidth:27,data:g.map(x=>({value:x.oportunidade_mes_reais,itemStyle:{color:FC[x.grupo]}})),
 label:{show:true,position:"right",formatter:x=>short(x.value),color:COLORS.ink,fontSize:10,fontWeight:800}}]});
 plot("chart-fin-target",{grid:{left:53,right:45,top:30,bottom:40},
 xAxis:{...category,data:ids},yAxis:{...values,min:0,max:12,axisLabel:{formatter:x=>x+"%"}},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+" · "+finPct(x.value)+" meta ponderada (maduras)"},
 series:[{type:"bar",barWidth:34,data:g.map(x=>({value:x.meta_media_ponderada_maduras_pct,itemStyle:{color:FC[x.grupo]}})),
 label:{show:true,position:"top",formatter:x=>finPct(x.value),fontSize:10,fontWeight:800,color:COLORS.ink},
 markLine:{silent:true,symbol:"none",lineStyle:{color:COLORS.red,type:"dashed"},label:{show:true,formatter:"6% rede",color:COLORS.red},data:[{yAxis:6}]}}]});
 financeTable();
}
function renderInsights(){
 let r=FIN.resumo,e=FIN.complementares,n=e.maturacao_novas.geral;
 kpis("bonusKpis",[
  ["NOVAS COMPARÁVEIS",nf(n.pares_com_primeiro_e_proximo_mes_completos)+"/"+nf(n.novas_total),nf(n.sem_janela_comparavel)+" sem dois blocos completos"],
  ["EVOLUÇÃO MEDIANA",finPct(n.crescimento_mediano_pareado_pct),"Primeiros 30 dias × seguintes"],
  ["TOP 10 RECEITA",finPct(r.concentracao_top_n_pct["10"]),"Concentração por receita equivalente"],
  ["GINI DE FATURAMENTO",nf(r.gini_revenue_equiv,3),"0 é igualdade; 1 concentração"]]);
 let obs=e.maturacao_novas.unidades,mx=Math.max(1,...obs.map(u=>Math.max(u.primeiros_30_dias,u.media_30_dias_seguinte)));
 let line=[{name:"Linha de igualdade",type:"line",silent:true,showSymbol:false,
  data:[[0,0],[mx*1.04,mx*1.04]],lineStyle:{color:"#c6bfb4",type:"dashed",width:1.5}}];
 for(let p of FIN.grupos){
  line.push({name:p.grupo,type:"scatter",symbolSize:12,itemStyle:{color:FC[p.grupo],opacity:.85},
   data:obs.filter(u=>u.grupo===p.grupo).map(u=>[u.primeiros_30_dias,u.media_30_dias_seguinte,u.franquia,u.variacao_pct])});
 }
 plot("chart-bonus-new",{grid:{left:72,right:22,top:24,bottom:64},
 legend:{data:FIN.grupos.map(x=>x.grupo),bottom:0,textStyle:{fontSize:11}},
 xAxis:{...values,min:0,max:mx*1.05,name:"1º bloco (R$)",nameLocation:"middle",nameGap:29,axisLabel:{formatter:x=>nf(x/1000,0)+" mil"}},
 yAxis:{...values,min:0,max:mx*1.05,name:"Demais (R$)",nameLocation:"middle",nameGap:43,axisLabel:{formatter:x=>nf(x/1000,0)+" mil"}},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.data?.[2]?x.data[2]+" · "+x.seriesName+"<br/>Primeiro: "+real(x.data[0])+"<br/>Demais: "+real(x.data[1])+"<br/>Variação: "+finPct(x.data[3]):""},
 series:line});
 let prom=e.diferenca_promocional_estratificada;
 plot("chart-bonus-promo",{grid:{left:59,right:35,top:35,bottom:57},legend:{bottom:0,textStyle:{fontSize:10}},
 xAxis:{...values,axisLabel:{formatter:x=>x+"%"}},yAxis:{...category,inverse:true,data:prom.map(x=>x.grupo)},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:it=>it[0].axisValue+"<br/>"+it.map(x=>x.seriesName+": "+finPct(x.value)).join("<br/>")},
 series:[{name:"Bruta",type:"bar",barWidth:16,data:prom.map(x=>x.diferenca_bruta_pct),itemStyle:{color:"#c4b9aa"}},
 {name:"Estratificada",type:"bar",barWidth:16,data:prom.map(x=>x.diferenca_estratificada_pct),itemStyle:{color:COLORS.gold}}]});
 let m=e.diversidade_formatos_entre_grupos;
 plot("chart-bonus-format",{grid:{left:88,right:30,top:25,bottom:65},legend:{bottom:0,textStyle:{fontSize:10}},
 xAxis:values,yAxis:{...category,inverse:true,data:m.map(x=>x.formato)},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:it=>it[0].axisValue+"<br/>"+it.map(x=>x.seriesName+": "+nf(x.value)).join("<br/>")},
 series:FIN.grupos.map(p=>({name:p.grupo,type:"bar",stack:"groups",barWidth:29,itemStyle:{color:FC[p.grupo]},data:m.map(x=>x.composicao[p.grupo]||0)}))});
 let top=Object.entries(r.concentracao_top_n_pct);
 plot("chart-bonus-top",{grid:{left:118,right:50,top:28,bottom:33},
 xAxis:{...values,min:0,max:40,axisLabel:{formatter:x=>x+"%"}},
 yAxis:{...category,inverse:true,data:top.map(x=>"Top "+x[0]+" unidades")},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+": "+finPct(x.value)+" da receita"},
 series:[{type:"bar",barWidth:27,data:top.map(x=>x[1]),itemStyle:{color:COLORS.gold},
 label:{show:true,position:"right",formatter:x=>finPct(x.value),fontWeight:800,fontSize:11,color:COLORS.ink}}]});
 $("newUnitsTable").querySelector("tbody").innerHTML=obs.slice().sort((a,b)=>a.grupo.localeCompare(b.grupo)||a.franquia.localeCompare(b.franquia)).map(u=>`
 <tr><td><b style="color:#9c7441">${u.franquia}</b></td><td><b style="color:${FC[u.grupo]}">${u.grupo}</b></td>
 <td>${real(u.primeiros_30_dias)}</td><td>${real(u.media_30_dias_seguinte)}</td>
 <td style="color:${u.variacao_pct>=0?COLORS.green:COLORS.red};font-weight:800">${u.variacao_pct>=0?"+":""}${finPct(u.variacao_pct)}</td>
 <td>${nf(u.blocos_completos_sequentes)}</td></tr>`).join("");
}