"use strict";
// CDD / Braseira Norte. Dados agregados reais da FNAT, sem inferir causalidade.
const DATA=window.BRASEIRA_DATA;
if(!DATA||!window.echarts){document.body.innerHTML="<p style='padding:32px'>Falha ao carregar dados ou gráficos. Verifique os arquivos do projeto.</p>";throw Error("DADOS_OU_ECHARTS_AUSENTES")}
const $=id=>document.getElementById(id);
const COLORS={ink:"#20201e",gold:"#b58b55",red:"#aa5149",green:"#4a8974",blue:"#5e8290",muted:"#918a80",line:"#eee9e1",neutral:"#d3d0c9"};
const FORMAT={"Rua":"#b58b55","Shopping":"#5e8290","Drive-thru":"#aa5149","Quiosque":"#6f8c75"};
const DIAS=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const s={page:"visao",formato:"todos",porte:"todos",franquia:"todos",from:0,to:DATA.meses.length-1,promo:"todos",search:"",sort:"receita",desc:true};
const pages={
visao:["01 / INTELIGÊNCIA DE NEGÓCIOS","Uma rede. <em>Muitos comportamentos.</em>","Antes de perguntar quais restaurantes pertencem ao mesmo grupo, precisamos compreender como a rede funciona."],
franquias:["02 / INTELIGÊNCIA POR FRANQUIA","480 histórias. <em>Uma base.</em>","Compare unidades individualmente, observe a dispersão e investigue seus perfis operacionais."],
canais:["03 / COMPOSIÇÃO DOS CANAIS","Onde acontece <em>a venda?</em>","A participação do delivery e do presencial muda entre as franquias."],
calendario:["04 / RELÓGIO OPERACIONAL","Cada dia tem <em>um ritmo.</em>","Compare dias de funcionamento sem confundir unidade fechada com dado faltante."],
promocoes:["05 / MENSURAÇÃO RESPONSÁVEL","Promoção não é <em>causalidade.</em>","Observe associações entre dias promocionais e receita, sem atribuir efeito causal."],
metodo:["06 / TRANSPARÊNCIA E FONTE","Sem contexto, <em>o número engana.</em>","Dicionário de dados, critérios, limitações e rastreabilidade."],
};
const nf=(x,d=0)=>Number.isFinite(x)?x.toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
const real=(x,d=2)=>Number.isFinite(x)?"R$ "+nf(x,d):"—";
const short=x=>!Number.isFinite(x)?"—":x>=1e9?"R$ "+nf(x/1e9,2)+" bi":x>=1e6?"R$ "+nf(x/1e6,2)+" mi":x>=1e3?"R$ "+nf(x/1e3,1)+" mil":real(x,0);
const pct=(x,d=1)=>Number.isFinite(x)?nf(x,d)+"%":"—";
const div=(a,b)=>b?a/b:NaN;
const monthName=m=>{const [y,mm]=m.split("-");return ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][+mm-1]+"/"+y.slice(2)};
function zero(){return {loja:0,delivery:0,receita:0,pedidos:0,dias:0,abertos:0,fechados:0,feriados:0}}
function add(a,row){let days=row[5];a.loja+=row[6];a.delivery+=row[7];a.receita+=row[6]+row[7];a.pedidos+=row[8];a.dias+=days;a.feriados+=row[9];if(row[4])a.abertos+=days;else a.fechados+=days;return a}
const mk=(m,k)=>{if(!m.has(k))m.set(k,zero());return m.get(k)};
function analyze(ignorePromo=false){
 const total=zero(),byMonth=new Map(),byFormat=new Map(),byUnit=new Map(),byWeek=new Map(),byFormatWeek=new Map(),byPromo=new Map(),byFormatPromo=new Map(),seen=new Set();
 let promoClosed=0;
 for(const r of DATA.grupos){
  if(r[1]<s.from||r[1]>s.to)continue;
  const u=DATA.franquias[r[0]];
  if(s.formato!=="todos"&&u.formato!==s.formato)continue;
  if(s.porte!=="todos"&&u.porte!==s.porte)continue;
  if(s.franquia!=="todos"&&u.id!==s.franquia)continue;
  if(!ignorePromo&&s.promo!=="todos"&&String(r[3])!==s.promo)continue;
  seen.add(r[0]);add(total,r);add(mk(byMonth,r[1]),r);add(mk(byFormat,u.formato),r);
  add(mk(byUnit,r[0]),r);add(mk(byWeek,r[2]),r);add(mk(byFormatWeek,u.formato+"|"+r[2]),r);
  add(mk(byPromo,r[3]),r);add(mk(byFormatPromo,u.formato+"|"+r[3]),r);
  if(r[3]===1&&!r[4])promoClosed+=r[5];
 }
 const units=[...byUnit].map(([idx,t])=>({...DATA.franquias[idx],idx,...t,
  ticket:div(t.receita,t.pedidos),deliveryPct:100*div(t.delivery,t.receita),receitaDia:div(t.receita,t.abertos)}));
 return {total,byMonth,byFormat,byUnit,byWeek,byFormatWeek,byPromo,byFormatPromo,units,franquias:seen.size,promoClosed};
}
let a,b;
const charts={};
const basic={backgroundColor:"transparent",animationDuration:460,textStyle:{fontFamily:"DM Sans,Segoe UI,sans-serif",color:"#55504a"},
tooltip:{trigger:"axis",confine:true,backgroundColor:"#1a1918",borderWidth:0,textStyle:{color:"#fff",fontSize:12}},
grid:{left:60,right:25,top:30,bottom:45}};
const category={type:"category",axisTick:{show:false},axisLine:{lineStyle:{color:"#e0dbd3"}},axisLabel:{color:"#7c766d",fontSize:11}};
const values={type:"value",axisTick:{show:false},axisLine:{show:false},splitLine:{lineStyle:{color:"#efebe6"}},axisLabel:{color:"#7c766d",formatter:x=>x>=1e6?nf(x/1e6,0)+"mi":x>=1000?nf(x/1000,0)+"mil":nf(x)}};
function plot(id,opt){
 let node=$(id);if(!node||!node.offsetWidth)return;
 let ch=charts[id]||(charts[id]=echarts.init(node,null,{renderer:"canvas"}));
 ch.resize();ch.setOption({...basic,...opt},true);return ch;
}
function kpis(id,arr){$(id).innerHTML=arr.map(([label,value,note])=>`<div class="kpi"><span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong><span class="kpi-foot">${note}</span></div>`).join("")}
function renderOverview(){
 const t=a.total;
 kpis("kpis",[
 ["RECEITA TOTAL",short(t.receita),real(t.receita)],
 ["PEDIDOS REGISTRADOS",nf(t.pedidos),nf(a.franquias)+" franquias no recorte"],
 ["TICKET MÉDIO",real(div(t.receita,t.pedidos)),"Receita / pedidos"],
 ["DELIVERY NA RECEITA",pct(100*div(t.delivery,t.receita)),nf(t.abertos)+" franquia-dias abertos"]
 ]);
 const formats=[...a.byFormat].sort((p,q)=>q[1].receita-p[1].receita),lead=formats[0];
 $("overview-insights").innerHTML=[
 `<div class="insight"><span class="insight-no">LEITURA 01 / O VOLUME</span><h4>${lead?lead[0]+" lidera em faturamento":"Sem dados no filtro"}</h4><p>${lead?short(lead[1].receita)+". Faturamento não representa lucro ou eficiência.":"Altere os filtros para ver a rede."}</p></div>`,
 `<div class="insight"><span class="insight-no">LEITURA 02 / OS CANAIS</span><h4>${pct(100*div(t.delivery,t.receita))} via delivery</h4><p>Participação na receita, não no número de pedidos; o canal pode incluir aplicativos e operações próprias.</p></div>`,
 `<div class="insight"><span class="insight-no">LEITURA 03 / O MÉTODO</span><h4>Antes dos clusters</h4><p>Aqui estamos descrevendo a base. O número de grupos e sua estabilidade serão testados em outra etapa.</p></div>`].join("");
 const mt=DATA.meses.map((m,i)=>({name:monthName(m),value:(a.byMonth.get(i)||zero()).receita}));
 plot("chart-month",{xAxis:{...category,data:mt.map(x=>x.name)},yAxis:values,tooltip:{...basic.tooltip,formatter:it=>it[0]?.axisValue+"<br/><b>"+real(it[0]?.value||0)+"</b>"},
 series:[{type:"line",smooth:.2,data:mt.map(x=>x.value),symbolSize:6,lineStyle:{width:3,color:COLORS.gold},itemStyle:{color:COLORS.gold},
 areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"#bd9b6940"},{offset:1,color:"#bd9b6900"}]}}}]});
 plot("chart-format",{grid:{left:92,right:78,top:20,bottom:22},xAxis:{...values,axisLabel:{formatter:v=>nf(v/1e6,0)+"mi"}},yAxis:{...category,inverse:true,data:formats.map(x=>x[0])},
 tooltip:{...basic.tooltip,trigger:"item",formatter:it=>it.name+"<br/>"+real(it.value)},
 series:[{type:"bar",barWidth:20,data:formats.map(([name,z])=>({name,value:z.receita,itemStyle:{color:FORMAT[name]}})),label:{show:true,position:"right",formatter:x=>short(x.value),fontSize:10,color:COLORS.ink}}]});
 plot("chart-channel",{grid:{left:30,right:16,top:24,bottom:68},legend:{bottom:5,textStyle:{fontSize:11}},
 xAxis:{...values,min:0,max:Math.max(1,t.receita),axisLabel:{show:false},splitLine:{show:false}},yAxis:{...category,data:["Total"],axisLabel:{show:false}},
 tooltip:{...basic.tooltip,trigger:"item",formatter:it=>it.seriesName+"<br/>"+real(it.value)},
 series:[{name:"Presencial",type:"bar",stack:"all",barWidth:55,itemStyle:{color:COLORS.ink},data:[t.loja],label:{show:t.loja>0,position:"inside",color:"#fff",formatter:()=>pct(100*div(t.loja,t.receita))}},
 {name:"Delivery",type:"bar",stack:"all",barWidth:55,itemStyle:{color:COLORS.gold},data:[t.delivery],label:{show:t.delivery>0,position:"inside",color:"#171615",formatter:()=>pct(100*div(t.delivery,t.receita))}}]});
}
function renderFranquias(){
 const units=a.units.filter(x=>Number.isFinite(x.ticket)&&Number.isFinite(x.deliveryPct));
 const series=[...new Set(units.map(x=>x.formato))].map(fmt=>({name:fmt,type:"scatter",data:units.filter(x=>x.formato===fmt).map(x=>[x.deliveryPct,x.ticket,x.receita,x.id]),
 symbolSize:x=>Math.min(36,8+Math.sqrt(x[2]/500000)),itemStyle:{color:FORMAT[fmt],opacity:.8}}));
 const c=plot("chart-scatter",{grid:{left:65,right:24,top:35,bottom:68},legend:{bottom:4,textStyle:{fontSize:11}},
 xAxis:{...values,min:0,max:100,axisLabel:{formatter:v=>v+"%"}},yAxis:values,
 tooltip:{...basic.tooltip,trigger:"item",formatter:r=>`<b>${r.data[3]} / ${r.seriesName}</b><br/>Delivery: ${pct(r.data[0])}<br/>Ticket: ${real(r.data[1])}<br/>Receita: ${real(r.data[2])}`},series});
 if(c){c.off("click");c.on("click",r=>selectUnit(r.data?.[3]))}
 const ranks=[...a.units].sort((x,y)=>y.receita-x.receita).slice(0,12);
 const ch=plot("chart-ranking",{grid:{left:57,right:90,top:12,bottom:22},xAxis:values,yAxis:{...category,inverse:true,data:ranks.map(x=>x.id)},
 tooltip:{...basic.tooltip,trigger:"item",formatter:r=>r.name+"<br/>"+real(r.value)},
 series:[{type:"bar",data:ranks.map((x,i)=>({value:x.receita,itemStyle:{color:i===0?COLORS.gold:"#c9b99f"}})),barWidth:19,label:{show:true,position:"right",formatter:r=>short(r.value),fontSize:10,color:COLORS.ink}}]});
 if(ch){ch.off("click");ch.on("click",r=>selectUnit(r.name))}
 renderTable();
}
function selectUnit(id){if(!id)return;s.franquia=id;$("sel-franquia").value=id;refresh();toast(id+" selecionada")}
function renderTable(){
 let list=a.units.filter(x=>(x.id+" "+x.formato+" "+x.porte).toLowerCase().includes(s.search.toLowerCase()));
 const field=s.sort,sgn=s.desc?-1:1;
 list.sort((u,v)=>typeof u[field]==="string"?sgn*u[field].localeCompare(v[field]):sgn*((u[field]||0)-(v[field]||0)));
 $("unitsTable").querySelector("tbody").innerHTML=list.slice(0,50).map(u=>`<tr data-id="${u.id}"><td style="font-weight:800;color:#9c7547">${u.id}</td>
 <td>${u.formato}</td><td>${u.porte}</td><td>${real(u.receita)}</td><td>${nf(u.pedidos)}</td><td>${real(u.ticket)}</td>
 <td>${pct(u.deliveryPct)}</td><td>${nf(u.abertos)}</td></tr>`).join("");
 $("tableCount").textContent="Exibindo "+nf(Math.min(list.length,50))+" de "+nf(list.length)+" franquias";
 $("unitsTable").querySelectorAll("tbody tr").forEach(tr=>tr.addEventListener("click",()=>selectUnit(tr.dataset.id)));
}
function renderCanais(){
 const t=a.total;
 kpis("channel-kpis",[
 ["RECEITA PRESENCIAL",short(t.loja),pct(100*div(t.loja,t.receita))+" da receita"],
 ["RECEITA DELIVERY",short(t.delivery),pct(100*div(t.delivery,t.receita))+" da receita"],
 ["PEDIDOS TOTAIS",nf(t.pedidos),"Sem distribuição por canal"],
 ["FRANQUIAS NO RECORTE",nf(a.franquias),"Unidades com registros"]
 ]);
 const fs=[...a.byFormat].sort((x,y)=>y[1].receita-x[1].receita);
 plot("chart-formatmix",{grid:{left:89,right:38,top:30,bottom:49},xAxis:{...values,max:100,axisLabel:{formatter:v=>v+"%"}},yAxis:{...category,data:fs.map(x=>x[0]),inverse:true},
 legend:{bottom:0,textStyle:{fontSize:11}},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:arr=>arr[0]?.axisValue+"<br/>"+arr.map(v=>v.seriesName+": "+pct(v.value)).join("<br/>")},
 series:[{name:"Presencial",type:"bar",stack:"canal",barWidth:25,itemStyle:{color:COLORS.ink},data:fs.map(x=>100*div(x[1].loja,x[1].receita)),
 label:{show:true,position:"inside",color:"#fff",formatter:v=>v.value>10?pct(v.value,0):""}},
 {name:"Delivery",type:"bar",stack:"canal",barWidth:25,itemStyle:{color:COLORS.gold},data:fs.map(x=>100*div(x[1].delivery,x[1].receita)),
 label:{show:true,position:"inside",color:"#111",formatter:v=>v.value>10?pct(v.value,0):""}}]});
 const monthly=DATA.meses.map((m,i)=>{const x=a.byMonth.get(i);return x?.receita?100*x.delivery/x.receita:NaN});
 plot("chart-deliverytrend",{grid:{left:49,right:21,top:28,bottom:47},xAxis:{...category,data:DATA.meses.map(monthName)},
 yAxis:{...values,min:0,max:100,axisLabel:{formatter:v=>v+"%"}},
 tooltip:{...basic.tooltip,formatter:v=>v[0]?.axisValue+"<br/>"+pct(v[0]?.data)},
 series:[{type:"line",data:monthly,smooth:.3,symbolSize:7,lineStyle:{color:COLORS.gold,width:3},itemStyle:{color:COLORS.gold},
 areaStyle:{color:"#dbc19d50"}}]});
}
function renderCalendar(){
 const t=a.total;
 kpis("calendar-kpis",[
 ["FRANQUIA-DIAS ABERTOS",nf(t.abertos),"Dias efetivos de funcionamento"],
 ["FRANQUIA-DIAS FECHADOS",nf(t.fechados),"Não são dados ausentes"],
 ["RECEITA / DIA ABERTO",real(div(t.receita,t.abertos)),"Receita / franquia-dia aberto"],
 ["FERIADOS MARCADOS",nf(t.feriados),"Contagem de franquia-dias"]
 ]);
 const data=DIAS.map((d,i)=>{const x=a.byWeek.get(i+1);return div(x?.receita||0,x?.abertos||0)});
 plot("chart-weekday",{grid:{left:58,right:21,top:27,bottom:41},xAxis:{...category,data:DIAS},yAxis:values,
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+"<br/>"+real(x.value)+" / dia aberto"},
 series:[{type:"bar",barMaxWidth:31,data:data.map((v,i)=>({value:Number.isFinite(v)?v:0,itemStyle:{color:i>4?COLORS.gold:COLORS.ink}})),
 label:{show:true,position:"top",formatter:x=>short(x.value),color:COLORS.ink,fontSize:10}}]});
 const forms=["Rua","Shopping","Drive-thru","Quiosque"].filter(f=>a.byFormat.has(f));
 let vals=[],min=Infinity,max=-Infinity;
 forms.forEach((fmt,y)=>DIAS.forEach((day,x)=>{const z=a.byFormatWeek.get(fmt+"|"+(x+1));let v=div(z?.receita||0,z?.abertos||0);v=Number.isFinite(v)?v:0;vals.push([x,y,Math.round(v)]);min=Math.min(min,v);max=Math.max(max,v)}));
 plot("chart-heatmap",{grid:{left:87,right:25,top:32,bottom:80},xAxis:{...category,data:DIAS,splitArea:{show:true}},
 yAxis:{...category,data:forms,inverse:true,splitArea:{show:true}},tooltip:{...basic.tooltip,trigger:"item",formatter:r=>forms[r.data[1]]+" / "+DIAS[r.data[0]]+"<br/>"+real(r.data[2])+" por dia aberto"},
 visualMap:{min,max,orient:"horizontal",left:"center",bottom:0,itemWidth:14,itemHeight:135,text:["Maior","Menor"],textGap:8,textStyle:{color:COLORS.muted,fontSize:10},
 inRange:{color:["#31865c","#bbd56a","#f0d45e","#df884c","#b84138"]}},
 series:[{type:"heatmap",data:vals}]});
}
function renderPromo(){
 // Comparação pede as duas populações. Ignora apenas o filtro "promo".
 const p0=b.byPromo.get(0)||zero(),p1=b.byPromo.get(1)||zero();
 const mean0=div(p0.receita,p0.abertos),mean1=div(p1.receita,p1.abertos),change=100*(mean1/mean0-1);
 kpis("promo-kpis",[
 ["ABERTOS COM PROMO",nf(p1.abertos),"Franquia-dias promocionais"],
 ["ABERTOS SEM PROMO",nf(p0.abertos),"Franquia-dias sem promoção"],
 ["RECEITA / DIA COM PROMO",real(mean1),"Média observada"],
 ["VARIAÇÃO DA MÉDIA",pct(change),"Não é efeito causal"]
 ]);
 const fmt=["Rua","Shopping","Drive-thru","Quiosque"].filter(f=>b.byFormat.has(f));
 const means=[[],[]],delta=[];
 fmt.forEach(f=>{let z0=b.byFormatPromo.get(f+"|0")||zero(),z1=b.byFormatPromo.get(f+"|1")||zero();
 let a0=div(z0.receita,z0.abertos),a1=div(z1.receita,z1.abertos);means[0].push(Number.isFinite(a0)?a0:0);means[1].push(Number.isFinite(a1)?a1:0);delta.push(Number.isFinite(a0)&&a0>0?100*(a1/a0-1):0)});
 plot("chart-promo",{grid:{left:91,right:34,top:33,bottom:56},legend:{bottom:0,textStyle:{fontSize:11}},xAxis:values,yAxis:{...category,data:fmt,inverse:true},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:arr=>arr[0]?.axisValue+"<br/>"+arr.map(x=>x.seriesName+" "+real(x.value)).join("<br/>")},
 series:[{name:"Sem promoção",type:"bar",barWidth:17,data:means[0],itemStyle:{color:"#bab8b3"}},
 {name:"Com promoção",type:"bar",barWidth:17,data:means[1],itemStyle:{color:COLORS.gold}}]});
 plot("chart-promolift",{grid:{left:94,right:63,top:30,bottom:33},xAxis:{...values,axisLabel:{formatter:v=>v+"%"}},
 yAxis:{...category,inverse:true,data:fmt},tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+": "+pct(x.value)+" (diferença de médias)"},
 series:[{type:"bar",barWidth:28,data:delta.map(v=>({value:v,itemStyle:{color:v>=0?COLORS.green:COLORS.red}})),
 label:{show:true,position:"outside",formatter:x=>pct(x.value),fontSize:11,fontWeight:800,color:COLORS.ink}}]});
 $("page-promocoes").querySelector(".page-summary p").textContent="Comparação de dias com e sem promoção no mesmo período, porte e franquia; nesta página o filtro 'Promoção' é ignorado para preservar os dois grupos.";
}
const defs=[
["franquias.csv","franquia","Identificador da unidade; chave de relacionamento."],
["franquias.csv","formato","Tipo físico: Rua, Shopping, Drive-thru, Quiosque."],
["franquias.csv","porte_cidade","Capital, Grande cidade ou Interior; sem município."],
["franquias.csv","data_inauguracao","Dia em que a unidade começou a operar."],
["franquias.csv","area_m2","Área física em metros quadrados."],
["franquias.csv","assentos","Capacidade de assentos da unidade."],
["franquias.csv","distancia_concorrente_m","Metros até concorrente direto; 4 valores ausentes."],
["vendas_diarias.csv","franquia","Chave estrangeira do cadastro."],
["vendas_diarias.csv","data","Data da operação, uma franquia por dia."],
["vendas_diarias.csv","dia_semana","Segunda=1 a domingo=7."],
["vendas_diarias.csv","aberta","1 aberta; 0 fechada. Dia fechado não é ausente."],
["vendas_diarias.csv","faturamento_loja","Receita presencial/retirada, em reais."],
["vendas_diarias.csv","faturamento_delivery","Receita de delivery (apps e canal próprio)."],
["vendas_diarias.csv","pedidos","Quantidade de pedidos, não discriminada por canal."],
["vendas_diarias.csv","promo","Sinalização de campanha ativa; não comprova efeito causal."],
["vendas_diarias.csv","feriado","Indicador de feriado nacional."],
];
function renderMetodo(){
 const m=DATA.meta; kpis("quality-kpis",[
 ["FRANQUIAS",nf(m.franquias),"Identificadores únicos"],
 ["REGISTROS DIÁRIOS",nf(m.registros_diarios),"Franquia × data"],
 ["DISTÂNCIAS AUSENTES",nf(m.nulos_distancia),"Única variável com nulos"],
 ["PROMO EM DIA FECHADO",nf(m.promocao_fechados),"Sinalização observada"]
 ]);
 const tests=[["IDs de franquia duplicados","0 ocorrências"],["Chaves franquia × data duplicadas","0 ocorrências"],
 ["Vendas sem franquia cadastrada","0 ocorrências"],["Datas anteriores à inauguração","0 ocorrências"],
 ["Lacunas após abertura","0 ocorrências"],["Dia da semana incorreto","0 ocorrências"],
 ["Dias fechados com receita positiva","0 ocorrências"],
 ["Distância de concorrente ausente","4 franquias"],["Campanha marcada em dia fechado","1.038 registros"]];
 $("qaList").innerHTML=tests.map(([a,b])=>`<div class="qa-row"><span>${a}</span><strong>${b}</strong></div>`).join("");
 $("dictionaryBody").innerHTML=defs.map(([a,b,c])=>`<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join("");
 plot("chart-maturity",{grid:{left:25,right:25,top:20,bottom:66},legend:{bottom:0,textStyle:{fontSize:11}},
 xAxis:{...values,max:m.franquias,axisLabel:{show:false},splitLine:{show:false}},yAxis:{...category,data:["Franquias"],axisLabel:{show:false}},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.seriesName+": "+nf(x.value)+" franquias"},
 series:[{name:"Com 6+ meses",type:"bar",stack:"all",barWidth:61,data:[m.franquias-m.novas],itemStyle:{color:COLORS.ink},label:{show:true,position:"inside",formatter:nf(m.franquias-m.novas),color:"#fff",fontSize:16,fontWeight:800}},
 {name:"Novas (<6 meses)",type:"bar",stack:"all",barWidth:61,data:[m.novas],itemStyle:{color:COLORS.gold},label:{show:true,position:"inside",formatter:nf(m.novas),color:"#1b1812",fontSize:14,fontWeight:800}}]});
}
function display(){
 if(s.page==="visao")renderOverview();
 if(s.page==="franquias")renderFranquias();
 if(s.page==="canais")renderCanais();
 if(s.page==="calendario")renderCalendar();
 if(s.page==="promocoes")renderPromo();
 if(s.page==="metodo")renderMetodo();
}
function refresh(){
 a=analyze(false);b=analyze(true);
 $("scope-text").textContent=nf(a.franquias)+" franquias · "+monthName(DATA.meses[s.from])+" a "+monthName(DATA.meses[s.to])+" · "+(s.promo==="todos"?"todos os dias":s.promo==="1"?"com promoção":"sem promoção");
 display();
}
function showPage(page){
 if(!pages[page])return;
 s.page=page;
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 document.querySelectorAll(".page").forEach(b=>b.classList.toggle("active",b.id==="page-"+page));
 $("mobilePage").value=page;
 $("page-kicker").textContent=pages[page][0];$("page-title").innerHTML=pages[page][1];$("page-desc").textContent=pages[page][2];
 if(location.hash!=="#"+page)history.replaceState(null,"","#"+page);
 refresh();window.scrollTo({top:0,behavior:"instant"});
}
let timer;
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("visible");clearTimeout(timer);timer=setTimeout(()=>t.classList.remove("visible"),2600)}
function populate(id,vals,label=x=>x){vals.forEach(x=>{let o=document.createElement("option");o.value=x;o.textContent=label(x);$(id).append(o)})}
function setup(){
 populate("sel-format",[...new Set(DATA.franquias.map(x=>x.formato))].sort());
 populate("sel-porte",[...new Set(DATA.franquias.map(x=>x.porte))].sort());
 populate("sel-franquia",DATA.franquias.map(x=>x.id));
 populate("sel-from",DATA.meses,monthName);populate("sel-to",DATA.meses,monthName);
 $("sel-from").value=DATA.meses[0];$("sel-to").value=DATA.meses.at(-1);
 for(const [id,key] of [["sel-format","formato"],["sel-porte","porte"],["sel-franquia","franquia"],["sel-promo","promo"]]){
 $(id).addEventListener("change",e=>{s[key]=e.target.value;refresh()})}
 $("sel-from").addEventListener("change",e=>{s.from=DATA.meses.indexOf(e.target.value);if(s.from>s.to){s.to=s.from;$("sel-to").value=DATA.meses[s.to]}refresh()});
 $("sel-to").addEventListener("change",e=>{s.to=DATA.meses.indexOf(e.target.value);if(s.to<s.from){s.from=s.to;$("sel-from").value=DATA.meses[s.from]}refresh()});
 $("resetFilters").addEventListener("click",()=>{
 s.formato=s.porte=s.franquia=s.promo="todos";s.from=0;s.to=DATA.meses.length-1;s.search="";
 [["sel-format","todos"],["sel-porte","todos"],["sel-franquia","todos"],["sel-promo","todos"],["sel-from",DATA.meses[0]],["sel-to",DATA.meses.at(-1)]].forEach(([k,v])=>$(k).value=v);
 $("searchUnits").value="";refresh();toast("Filtros redefinidos")});
 document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
 populate("mobilePage",Object.keys(pages),k=>({visao:"01 Visão executiva",franquias:"02 Franquias",canais:"03 Canais e delivery",calendario:"04 Ritmo de vendas",promocoes:"05 Promoções",metodo:"06 Dados e método"})[k]);
 $("mobilePage").addEventListener("change",e=>showPage(e.target.value));
 $("searchUnits").addEventListener("input",e=>{s.search=e.target.value;renderTable()});
 document.querySelectorAll("#unitsTable th[data-sort]").forEach(th=>th.addEventListener("click",()=>{let k=th.dataset.sort;s.desc=s.sort===k?!s.desc:k!=="id"&&k!=="formato"&&k!=="porte";s.sort=k;renderTable()}));
 $("downloadCsv").addEventListener("click",()=>{
 const cols=["id","formato","porte","receita","loja","delivery","pedidos","ticket","deliveryPct","abertos","fechados","inauguracao"];
 const table=[cols.join(";"),...a.units.map(u=>cols.map(k=>typeof u[k]==="number"?String(Math.round(u[k]*100)/100).replace(".",","):u[k]).join(";"))].join("\r\n");
 const url=URL.createObjectURL(new Blob(["\uFEFF"+table],{type:"text/csv;charset=utf-8"}));
 const l=document.createElement("a");l.href=url;l.download="CDD_BraseiraNorte_Franquias_Filtradas.csv";l.click();setTimeout(()=>URL.revokeObjectURL(url),700);toast("CSV exportado")});
 window.addEventListener("hashchange",()=>showPage(pages[location.hash.slice(1)]?location.hash.slice(1):"visao"));
 window.addEventListener("resize",()=>Object.values(charts).forEach(ch=>ch.resize()));
 showPage(pages[location.hash.slice(1)]?location.hash.slice(1):"visao");
 document.documentElement.dataset.ready="true";
}
setup();