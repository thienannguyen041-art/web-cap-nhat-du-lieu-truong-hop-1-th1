/* Refresh controller: one configured source, atomic validation, no fallback or persistence. */
(function(root){'use strict';
class PublicWorkbookSource{
 constructor(config,io){this.config=config;this.io=io;this.fetch=io.fetch||root.fetch.bind(root);this.now=io.now||(()=>new Date());this.inflight=null;this.controller=null;this.epoch=0;this.local=false;this.lastSuccess=null;this.lastChanged=null;this.fingerprint=null;this.hadData=false;this.timer=null;this.state={phase:'idle'};}
 emit(phase,message){this.state={phase,message,lastSuccess:this.lastSuccess,lastChanged:this.lastChanged,local:this.local,hasData:this.hadData};this.io.status(this.state);}
 endpoint(){const c=this.config;if(!/^[A-Za-z0-9_-]+$/.test(c.spreadsheetId))throw Error('ID nguồn không hợp lệ. Kiểm tra config.js.');return `https://docs.google.com/spreadsheets/d/${c.spreadsheetId}/export?format=xlsx&_ts=${this.now().getTime()}`;}
 pauseLocal(){this.local=true;this.epoch++;this.controller?.abort();this.emit('local','Đang xem Excel tải lên thủ công. Tự cập nhật Google tạm dừng; bấm Làm mới dữ liệu để trở về nguồn Google.');}
 refresh(reason='manual'){
  if(reason!=='manual'&&(this.local||this.io.visible()===false))return Promise.resolve({skipped:true});
  if(this.local&&reason==='manual'){this.local=false;this.fingerprint=null;}
  if(this.inflight)return this.inflight;
  this.inflight=this.run(reason).finally(()=>{this.inflight=null;});return this.inflight;
 }
 async run(reason){const revision=++this.epoch;let timeout;this.controller=new AbortController();const signal=this.controller.signal;this.emit('loading','Đang đọc và kiểm tra nguồn Google…');
 try{
  timeout=setTimeout(()=>this.controller?.abort(),this.config.timeoutMs);const res=await this.fetch(this.endpoint(),{method:'GET',mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',signal,referrerPolicy:'no-referrer'});
  if(!res.ok)throw Error(`Google trả HTTP ${res.status}. Kiểm tra nguồn còn tồn tại và quyền xem công khai.`);
  const contentLength=Number(res.headers.get('content-length')||0);if(contentLength>this.config.maxBytes)throw Error('File nguồn vượt giới hạn 30 MB.');const buffer=await res.arrayBuffer();
  if(buffer.byteLength>this.config.maxBytes)throw Error('File nguồn vượt giới hạn 30 MB.');const magic=new Uint8Array(buffer,0,Math.min(2,buffer.byteLength));if(magic[0]!==80||magic[1]!==75)throw Error('Nguồn không trả workbook XLSX. Có thể nguồn yêu cầu đăng nhập hoặc link không đúng.');
  const prepared=await this.io.prepare(buffer,this.config);if(revision!==this.epoch||this.local)return {stale:true};
  const changed=prepared.fingerprint!==this.fingerprint;
  if(changed){this.io.apply(prepared);this.fingerprint=prepared.fingerprint;this.lastChanged=this.now().toISOString();}
  if(revision!==this.epoch)return {stale:true};this.hadData=true;this.lastSuccess=this.now().toISOString();this.emit('ready',changed?'Đã đọc thành công và cập nhật dữ liệu.':'Đã kiểm tra thành công; dữ liệu không thay đổi.');return {changed};
 }catch(err){if(revision!==this.epoch)return {stale:true};const detail=err.name==='AbortError'?'Quá thời gian chờ Google (45 giây).':err instanceof TypeError?'Không kết nối được nguồn Google (mạng/CORS hoặc quyền đọc).':err.message;
 this.emit('error',detail+(this.hadData?' Đang giữ dữ liệu cũ từ lần đọc thành công trước.':' Chưa có dữ liệu hợp lệ; không dùng dữ liệu nhúng hoặc dữ liệu mẫu.'));return {error:detail};
 }finally{clearTimeout(timeout);}}
 start(){this.refresh('open');this.timer=setInterval(()=>this.refresh('poll'),this.config.refreshMs);this.visibility=()=>{if(this.io.visible())this.refresh('visible');};root.document?.addEventListener('visibilitychange',this.visibility);}
 stop(){clearInterval(this.timer);this.epoch++;this.controller?.abort();root.document?.removeEventListener('visibilitychange',this.visibility);}
}
root.PublicWorkbookSource=PublicWorkbookSource;if(typeof module!=='undefined')module.exports=PublicWorkbookSource;
})(typeof window!=='undefined'?window:globalThis);
