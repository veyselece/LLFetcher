(() => {
  'use strict';
  const KEY = 'llfetcherLanguage';
  const pairs = {
    'LLFetcher 3.0+':'LinkedIn Learning Türkçe',
    'Analyze Video':'Videoyu analiz et','Analize Video':'Videoyu analiz et',
    'Load Last Course':'Son dersi yükle','Add This Course':'Bu dersi ekle',
    'Start Queue':'Kuyruğu başlat','Reset Queue':'Kuyruğu sıfırla','Stop Queue':'Kuyruğu durdur',
    'Queue is running':'İndirme kuyruğu çalışıyor','Queue already started':'Kuyruk zaten başlatılmış',
    'Requeue':'Yeniden kuyruğa al','Retry':'Yeniden dene','Download':'İndir','Status':'Durum',
    'Subtitle/Transcript':'Altyazı / Döküm','Media':'Medya','Select Media Format':'Medya biçimini seç',
    'Select Transcript Language':'Altyazı dilini seç','Get Available Media Format & Subtitle':'Kullanılabilir medya biçimlerini ve altyazıları getir',
    'Select Format':'Biçim seç','Select Subtitle Language':'Altyazı dili seç','Cancel':'İptal',
    'Save changes':'Değişiklikleri kaydet','Course Info':'Ders bilgileri','Course Config':'Ders ayarları',
    'Setting Page':'Ayarlar sayfası','Open File':'Dosya aç','Course ID':'Ders kimliği','File Name':'Dosya adı',
    'Filename':'Dosya adı','Exercise Files':'Alıştırma dosyaları','ExerciseFile':'Alıştırma dosyası',
    'Course IDS':'Ders kimlikleri','Enable Filename Index':'Dosya adına sıra numarası ekle',
    'Selected Fmt':'Seçilen biçim','Selected Trans':'Seçilen altyazı','Meta Status':'Bilgi durumu',
    'Video Status':'Video durumu','Caption Status':'Altyazı durumu','Video Size':'Video boyutu',
    'Last Error':'Son hata','Save Date':'Kayıt tarihi','Select Fmt':'Biçim seç',
    'Play in Video Player':'Video oynatıcıda oynat','Refresh Course Data':'Ders bilgilerini yenile',
    'Reconfigure Queue Setup':'Kuyruk ayarlarını yeniden yapılandır','Reset Queue Setup':'Kuyruk ayarlarını sıfırla',
    'Run Queue Setup':'Kuyruk ayarlarını uygula','Truncate':'Temizle','Table Manager':'Tablo Yöneticisi',
    'Database Explorer':'Veritabanı Gezgini','Courses':'Dersler','Course':'Ders','Teacher':'Eğitmen',
    'Instructor':'Eğitmen','Section':'Bölüm','Table':'Tablo','Description':'Açıklama','Size':'Boyut',
    'Counts':'Kayıt sayısı','Action':'İşlem','Export to json':'JSON olarak dışa aktar',
    'Storage size':'Depolama alanı','Numbering':'Numaralandırma','Enable numbering':'Numaralandırmayı etkinleştir',
    'Download Manager':'İndirme yöneticisi','Source Repo':'Kaynak kod deposu',
    'Are you sure want to reset Queue ?':'Kuyruğu sıfırlamak istediğinizden emin misiniz?',
    'Could not start queue single, Please wait until the last download complete':'Yeni indirme başlatılamadı. Önce devam eden indirmenin tamamlanmasını bekleyin.'
  };
  const reverse = new Map(Object.entries(pairs).map(([en,tr])=>[tr,en]));
  const norm = s => String(s || '').replace(/\s+/g,' ').trim();
  const original = new WeakMap();
  let lang = 'en';
  function textNodes(root) {
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
    const out=[]; while(walker.nextNode()) out.push(walker.currentNode); return out;
  }
  function applyText(root=document.body) {
    if (!root) return;
    for (const n of textNodes(root)) {
      if (!original.has(n)) original.set(n,n.nodeValue);
      const raw=original.get(n);
      const trimmed=norm(raw);
      if (lang==='tr') {
        if (pairs[trimmed]) n.nodeValue=raw.replace(trimmed,pairs[trimmed]);
        else if (reverse.has(trimmed)) n.nodeValue=raw.replace(trimmed,reverse.get(trimmed));
      } else {
        if (reverse.has(trimmed)) n.nodeValue=raw.replace(trimmed,reverse.get(trimmed));
      }
    }
    for (const el of root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label]') : []) {
      for (const attr of ['placeholder','title','aria-label']) {
        if (!el.hasAttribute(attr)) continue;
        const key='data-llf-orig-'+attr;
        if (!el.hasAttribute(key)) el.setAttribute(key,el.getAttribute(attr));
        const raw=el.getAttribute(key), t=norm(raw);
        if (lang==='tr' && pairs[t]) el.setAttribute(attr,pairs[t]);
        else if (lang==='en' && reverse.has(t)) el.setAttribute(attr,reverse.get(t));
        else el.setAttribute(attr,raw);
      }
    }
  }
  function updateCourseTitle() {
    const title = lang === 'tr' ? '"Kurs detayı"' : '"Course Detail"';
    document.documentElement.style.setProperty('--lltr-course-title', title);
  }
  function addSelector() {
    if (!document.body || document.getElementById('llf-language-picker')) return;
    const wrap = document.createElement('label');
    wrap.id = 'llf-language-picker';
    wrap.innerHTML = '<span>Language</span><select aria-label="Interface language"><option value="en">English</option><option value="tr">Türkçe</option></select>';
    // Compact selector placed in the otherwise empty right side of the popup's top banner.
    Object.assign(wrap.style, {
      position: 'fixed', top: '10px', right: '12px', zIndex: '2147483647',
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '4px 6px', background: 'rgba(19,34,56,.94)', color: '#fff',
      border: '1px solid #35506b', borderRadius: '8px',
      font: '600 10px system-ui,sans-serif', boxShadow: '0 2px 8px #0002'
    });
    const select = wrap.querySelector('select');
    Object.assign(select.style, {
      background: '#fff', color: '#172033', border: '1px solid #b8c4d3',
      borderRadius: '5px', padding: '3px 4px', font: '11px system-ui,sans-serif',
      maxWidth: '82px'
    });
    select.value = lang;
    select.addEventListener('change', async () => {
      lang = select.value;
      try { await chrome.storage.local.set({ [KEY]: lang }); } catch (_) {}
      applyText();
      updateCourseTitle();
      document.documentElement.lang = lang;
    });
    document.body.appendChild(wrap);
  }
  async function init() {
    try { const r=await chrome.storage.local.get(KEY); if (r && (r[KEY]==='tr'||r[KEY]==='en')) lang=r[KEY]; } catch(_){}
    document.documentElement.lang=lang;
    applyText();
    updateCourseTitle();
    // Selector is available on popup/options only; page injection remains hidden.
    if (/src\/(popup|option)\//.test(location.pathname)) addSelector();
    const mo=new MutationObserver(records=>{
      for(const r of records) for(const n of r.addedNodes) if(n.nodeType===1) applyText(n);
      if (/src\/(popup|option)\//.test(location.pathname)) addSelector();
    });
    mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
    if (chrome.storage?.onChanged) chrome.storage.onChanged.addListener((changes,area)=>{
      if(area==='local' && changes[KEY]) { lang=changes[KEY].newValue==='tr'?'tr':'en'; applyText(); updateCourseTitle(); }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();