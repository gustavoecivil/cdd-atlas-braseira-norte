"use strict";
// Perfis estatísticos do experimento 001, não re-treinados pelos filtros.
const GROUP_COLORS={"G01":"#b58b55","G02":"#a45146","G03":"#658b78","G04":"#648a9b","G05":"#6c5b8b"};
let groupLimit=50;
const pctg=x=>Number.isFinite(x)?nf(x,1)+"%":"—";
const groupProfile=id=>CLUSTERS.grupos.find(x=>x.grupo===id);
function groupSelect(g){
 s.grupo=s.grupo===g?"todos":g;
 $("sel-grupo").value=s.grupo;groupLimit=50;
 refresh();toast(s.grupo==="todos"?"Todos os grupos":s.grupo+" · "+groupProfile(s.grupo).nome);
}
function groupTilesRender(){
 $("groupTiles").innerHTML=CLUSTERS.grupos.map(p=>
 `<button class="group-tile${s.grupo===p.grupo?" active":""}" style="--profile-color:${GROUP_COLORS[p.grupo]}" data-group="${p.grupo}">
 <span class="group-code">${p.grupo}</span><div class="group-name">${p.nome}</div>
 <div class="group-metric">${nf(p.franquias)} <span style="font-size:12px;font-weight:700;color:#a39a8e">unidades</span></div>
 <div class="group-metric-note">${nf(p.novas)} novas · ${nf(p.maduras)} maduras</div>
 <div class="tiny">${p.descricao}</div></button>`).join("");
 $("groupTiles").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>groupSelect(b.dataset.group)));
}
function renderGroupUnitsTable(){
 const search=$("groupSearch").value.trim().toLowerCase();
 const ids=new Set(a.units.map(x=>x.id));
 const items=CLUSTERS.unidades.filter(u=>ids.has(u.franquia)&&
   (u.franquia+" "+u.grupo+" "+u.perfil+" "+u.formato+" "+u.porte_cidade).toLowerCase().includes(search))
   .sort((x,y)=>x.grupo.localeCompare(y.grupo)||x.franquia.localeCompare(y.franquia));
 $("groupUnitsTable").querySelector("tbody").innerHTML=items.slice(0,groupLimit).map(u=>`
 <tr data-id="${u.franquia}"><td style="font-weight:900;color:#997043">${u.franquia}</td>
 <td><strong style="color:${GROUP_COLORS[u.grupo]}">${u.grupo}</strong> · ${u.perfil}</td>
 <td>${u.formato}</td><td>${u.nova?"<span style='color:#9b7946;font-weight:800'>Nova · provisório</span>":"Maduro · treino"}</td>
 <td>${real(u.ticket)}</td><td>${pctg(u.share_delivery_pct)}</td><td>${pctg(u.share_fimsemana_pct)}</td>
 <td>${real(u.receita_dia_aberto)}</td></tr>`).join("");
 $("groupTableCount").textContent="Exibindo "+nf(Math.min(groupLimit,items.length))+" de "+nf(items.length)+" franquias no recorte";
 $("moreGroupRows").style.display=groupLimit>=items.length?"none":"inline-flex";
 $("groupUnitsTable").querySelectorAll("tr[data-id]").forEach(tr=>tr.addEventListener("click",()=>{
  let id=tr.dataset.id;s.franquia=id;$("sel-franquia").value=id;s.grupo="todos";$("sel-grupo").value="todos";
  showPage("franquias");toast("Franquia "+id+" selecionada");
 }));
 if(!$("groupSearch").dataset.bound){
  $("groupSearch").addEventListener("input",()=>{groupLimit=50;renderGroupUnitsTable()});
  $("moreGroupRows").addEventListener("click",()=>{groupLimit+=50;renderGroupUnitsTable()});
  $("groupSearch").dataset.bound="1";
 }
}
function renderGroups(){
 const meta=CLUSTERS.meta,profiles=CLUSTERS.grupos,ids=profiles.map(p=>p.grupo);
 kpis("group-kpis",[
  ["GRUPOS RECOMENDADOS",nf(meta.k),nf(meta.treino)+" maduras no treino"],
  ["SILHUETA DOS GRUPOS",nf(meta.silhouette,3),"Índice entre −1 e +1"],
  ["ARI DE ESTABILIDADE",nf(meta.ari_bootstrap,3),"Média de 16 reamostragens"],
  ["FORMATO ORIGINAL",nf(meta.silhouette_formato,3),"Silhueta das 4 classes físicas"]
 ]);
 groupTilesRender();
 $("groupProfileTable").querySelector("tbody").innerHTML=profiles.map(p=>`
 <tr data-group="${p.grupo}" ${s.grupo===p.grupo?"style='background:#f7efe3'":""}>
 <td><strong style="color:${GROUP_COLORS[p.grupo]}">${p.grupo}</strong></td><td>${p.nome}</td>
 <td>${nf(p.franquias)}</td><td>${nf(p.novas)}</td><td>${real(p.media_dia_aberto)}</td>
 <td>${real(p.ticket_ponderado)}</td><td>${pctg(p.delivery_pct)}</td>
 <td>${pctg(p.fimsemana_pct)}</td><td>${pctg(p.promocao_resposta_pct)}</td></tr>`).join("");
 $("groupProfileTable").querySelectorAll("tr[data-group]").forEach(tr=>tr.addEventListener("click",()=>groupSelect(tr.dataset.group)));
 renderGroupUnitsTable();
 const countChart=plot("chart-group-count",{
 grid:{left:60,right:70,top:24,bottom:30},xAxis:{...values,max:135},yAxis:{...category,inverse:true,data:ids},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+" · "+groupProfile(x.name).nome+"<br/>"+nf(x.value)+" unidades"},
 series:[{type:"bar",barWidth:28,data:profiles.map(p=>({
  value:p.franquias,itemStyle:{color:GROUP_COLORS[p.grupo],opacity:s.grupo==="todos"||s.grupo===p.grupo?1:.3}})),
 label:{show:true,position:"right",color:COLORS.ink,fontSize:12,fontWeight:800}}]});
 if(countChart){countChart.off("click");countChart.on("click",x=>groupSelect(x.name))}
 plot("chart-group-channels",{
 grid:{left:58,right:18,top:22,bottom:57},legend:{bottom:0,textStyle:{fontSize:11}},
 xAxis:{...category,data:ids},yAxis:{...values,min:0,max:75,axisLabel:{formatter:x=>x+"%"}},
 tooltip:{...basic.tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:it=>it[0].axisValue+"<br/>"+it.map(x=>x.seriesName+": "+pctg(x.value)).join("<br/>")},
 series:[{name:"Delivery",type:"bar",barMaxWidth:24,data:profiles.map(p=>p.delivery_pct),itemStyle:{color:COLORS.gold}},
 {name:"Fim de semana",type:"bar",barMaxWidth:24,data:profiles.map(p=>p.fimsemana_pct),itemStyle:{color:COLORS.blue}}]});
 const series=[];
 for(const p of profiles){
   const visible=s.grupo==="todos"||s.grupo===p.grupo,colour=GROUP_COLORS[p.grupo];
   for(const isNew of [false,true]){
    series.push({name:p.grupo+(isNew?" · novas":""),type:"scatter",symbol:isNew?"diamond":"circle",
     symbolSize:isNew?16:9,
     itemStyle:{color:colour,opacity:visible?(isNew?.97:.78):.14,borderWidth:isNew?1.6:0,borderColor:"#1e1d1b"},
     data:CLUSTERS.unidades.filter(u=>u.grupo===p.grupo&&u.nova===isNew).map(u=>[u.pc1,u.pc2,u.franquia,u.share_delivery_pct,u.share_fimsemana_pct,u.ticket])});
   }
 }
 const mapChart=plot("chart-groups-pca",{
 grid:{left:64,right:29,top:24,bottom:65},legend:{data:ids,bottom:0,textStyle:{fontSize:12,color:COLORS.muted}},
 xAxis:{...values,axisLabel:{formatter:x=>nf(x,1)},name:"PCA 1",nameLocation:"middle",nameGap:25},
 yAxis:{...values,axisLabel:{formatter:x=>nf(x,1)},name:"PCA 2",nameLocation:"middle",nameGap:36},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.data?
  `<b>${x.data[2]} · ${x.seriesName}</b><br/>Delivery ${pctg(x.data[3])}<br/>Fim de semana ${pctg(x.data[4])}<br/>Ticket ${real(x.data[5])}`:""},
 series});
 if(mapChart){mapChart.off("click");mapChart.on("click",x=>{const id=x.data?.[2];if(!id)return;s.franquia=id;$("sel-franquia").value=id;s.grupo="todos";$("sel-grupo").value="todos";showPage("franquias");toast(id+" selecionada")})}
 plot("chart-groups-k",{
 grid:{left:61,right:22,top:23,bottom:35},
 xAxis:{...category,data:CLUSTERS.testes_k.map(x=>String(x.k))},
 yAxis:{...values,min:.45,max:.9,axisLabel:{formatter:x=>nf(x,2)}},
 tooltip:{...basic.tooltip,formatter:it=>it[0].axisValue+" grupos · silhueta "+nf(it[0].value,3)},
 series:[{type:"line",smooth:.15,lineStyle:{color:COLORS.ink,width:3},symbolSize:10,
 data:CLUSTERS.testes_k.map(x=>({value:x.silhouette,symbol:x.k===meta.k?"diamond":"circle",
 symbolSize:x.k===meta.k?16:9,itemStyle:{color:x.k===meta.k?COLORS.gold:COLORS.ink},
 label:{show:x.k===meta.k,formatter:"k = "+meta.k,position:"bottom",color:COLORS.gold,fontWeight:800,fontSize:11}}))}]});
 plot("chart-groups-sil",{
 grid:{left:60,right:45,top:20,bottom:32},
 xAxis:{...values,min:0,max:1,axisLabel:{formatter:x=>nf(x,1)}},
 yAxis:{...category,inverse:true,data:ids},
 tooltip:{...basic.tooltip,trigger:"item",formatter:x=>x.name+" · "+nf(x.value,3)},
 series:[{type:"bar",barMaxWidth:25,data:profiles.map(p=>({value:p.silhueta_media_maduras,itemStyle:{color:GROUP_COLORS[p.grupo]}})),
 label:{show:true,position:"right",formatter:x=>nf(x.value,3),color:COLORS.ink,fontSize:11,fontWeight:850}}]});
}