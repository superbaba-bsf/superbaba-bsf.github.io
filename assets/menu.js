// Super Baba shared menu data. Server recomputes prices on order; display only.
window.SB_MENU = [
  {id:'p01',kind:'pizza',num:'01',name:'مارجريتا',price:140,detail:'صوص البيتزا الإيطالي - موتزاريلا - فلفل - زيتون - زعتر',photo:'assets/n-margherita.jpg'},
  {id:'p02',kind:'pizza',num:'02',name:'ميكس جبنة',price:160,detail:'صوص البيتزا الإيطالي - موتزاريلا - شيدر - رومي - امنتال - صوص جبنة - جودة - زعتر',photo:'assets/n-cheese.jpg'},
  {id:'p03',kind:'pizza',num:'03',name:'تشيكن رانش',price:165,detail:'صوص البيتزا الإيطالي - موتزاريلا - فراخ جريل - مشروم - صوص الرانش - زعتر',photo:'assets/n-ranch.jpg'},
  {id:'p04',kind:'pizza',num:'04',name:'تشيكن باربيكيو',price:160,detail:'صوص البيتزا الإيطالي - موتزاريلا - فراخ جريل - بصل - مشروم - صوص الباربيكيو - زعتر',photo:'assets/n-bbq.jpg'},
  {id:'p05',kind:'pizza',num:'05',name:'شاورما فراخ',price:165,detail:'صوص البيتزا الإيطالي - موتزاريلا - شاورما فراخ جريل - فلفل فريش - بصل - زعتر',photo:'assets/n-shawarma.jpg'},
  {id:'p06',kind:'pizza',num:'06',name:'تشيكن كريسبي',price:165,detail:'صوص البيتزا الإيطالي - موتزاريلا - فراخ كريسبي - فلفل - زعتر',photo:'assets/n-crispy.jpg'},
  {id:'p07',kind:'pizza',num:'07',name:'سجق شرقي',price:170,detail:'صوص البيتزا الإيطالي - موتزاريلا - سجق - بصل - فلفل - زعتر',photo:'assets/n-sogog.jpg'},
  {id:'p08',kind:'pizza',num:'08',name:'سوبر سوبريم',price:175,detail:'صوص البيتزا الإيطالي - موتزاريلا - بيبروني - سلامي - سجق إيطالي - فلفل - بصل - زيتون - زعتر',photo:'assets/n-supreme.jpg'},
  {id:'p09',kind:'pizza',num:'09',name:'تونة',price:180,detail:'صوص البيتزا الإيطالي - موتزاريلا - تونة - بصل - فلفل - زيتون - زعتر',photo:'assets/n-tuna.jpg'},
  {id:'p10',kind:'pizza',num:'10',name:'ميكس لحوم',price:185,detail:'صوص البيتزا الإيطالي - موتزاريلا - سجق - سلامي - شرائح اللحم - فلفل - زعتر',photo:'assets/n-meat.jpg'},
  {id:'x01',kind:'extra',num:'+',name:'حشو الأطراف',price:40,detail:'إضافة على البيتزا اللارج'},
  {id:'x02',kind:'extra',num:'+',name:'إضافة لحم',price:30,detail:'إضافة على البيتزا اللارج'},
  {id:'x03',kind:'extra',num:'+',name:'إضافة فراخ',price:30,detail:'إضافة على البيتزا اللارج'},
  {id:'x04',kind:'extra',num:'+',name:'إضافة جبن',price:30,detail:'إضافة على البيتزا اللارج'},
  {id:'s01',kind:'sandwich',num:'01',name:'برجر على الفحم',price:60,detail:'بيف مشوي على الفحم مع جبنة وخضار',photo:'assets/n-sbeef.jpg'},
  {id:'s02',kind:'sandwich',num:'02',name:'دبل برجر على الفحم',price:115,detail:'قطعتين بيف مشوي على الفحم',photo:'assets/n-sdbeef.jpg'},
  {id:'s03',kind:'sandwich',num:'03',name:'سندوتش كريسبي تشيكن',price:75,detail:'فراخ كريسبي مقرمشة',photo:'assets/n-schick.jpg'},
  {id:'s04',kind:'sandwich',num:'04',name:'دبل كريسبي تشيكن',price:105,detail:'قطعتين فراخ كريسبي',photo:'assets/n-sdchick.jpg'}
];
/* ---- live menu: the database is the source of truth (staff edit it from the kitchen page).
   The list above is only the first paint / offline fallback. ---- */
(function(){
  var ROOT=new URL('../',document.currentScript.src).href;
  var BASE='https://oyrebngeqxfkiczsltru.supabase.co', KEY='sb_publishable_BRk0ALVVuSwxKj1PpCB37g_uZycYy69';
  var stat={}; window.SB_MENU.forEach(function(m){stat[m.id]=m;});
  function abs(p){return !p?'':/^https?:/.test(p)?p:new URL(p,ROOT).href;}
  window.SB_MENU.forEach(function(m){m.photo=abs(m.photo);});
  function build(rows,all){
    var cnt={};
    return rows.filter(function(r){return all||r.active;}).sort(function(a,b){return a.sort-b.sort;}).map(function(r){
      var s=stat[r.id]||{}; cnt[r.kind]=(cnt[r.kind]||0)+1;
      return {id:r.id,kind:r.kind,num:r.kind==='extra'?'+':String(cnt[r.kind]).padStart(2,'0'),name:r.name,price:r.price_egp,
        detail:r.detail!=null?r.detail:(s.detail||''),photo:r.photo?abs(r.photo):(s.photo||''),sort:r.sort,active:r.active};
    });
  }
  function apply(rows){var out=build(rows,false); if(out.length)window.SB_MENU.splice.apply(window.SB_MENU,[0,window.SB_MENU.length].concat(out));}
  window.SB_MENU_BUILD=build;
  var CK='sb-menu.v1', cached=null;
  try{cached=localStorage.getItem(CK);if(cached)apply(JSON.parse(cached));}catch(e){cached=null;}
  window.SB_MENU_LOAD=function(){
    return fetch(BASE+'/rest/v1/menu_items?select=id,kind,sort,name,price_egp,active,detail,photo&active=eq.true&order=sort.asc',{headers:{apikey:KEY,Authorization:'Bearer '+KEY}})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(rows){
        if(!Array.isArray(rows)||!rows.length)return false;
        var j=JSON.stringify(rows); apply(rows);
        try{localStorage.setItem(CK,j);}catch(e){}
        return true;
      }).catch(function(){return false;});
  };
})();
window.SB_STATUS_AR = {new:'استلمنا طلبك',preparing:'بيتجهز',ready:'جاهز للتوصيل',assigned:'اتسلّم لمندوب',picked_up:'في الطريق',delivered:'اتسلّم',cancelled:'اتلغى'};
window.SB_MONEY = n => n + ' ج.م';
