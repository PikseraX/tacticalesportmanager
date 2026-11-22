package com.pikserax.tacticalesportsmanager;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.*;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@CapacitorPlugin(name="CareerBackup")
public class CareerBackupPlugin extends Plugin {
    private static final int MAX_BYTES=8*1024*1024;
    @PluginMethod public void exportSave(PluginCall call) {
        String text=call.getString("text", "");
        if(text.isEmpty() || text.getBytes(StandardCharsets.UTF_8).length>MAX_BYTES){call.reject("Geçersiz yedek boyutu.");return;}
        File cache=new File(getContext().getCacheDir(),"tem-backup-"+UUID.randomUUID()+".json");
        try(FileOutputStream out=new FileOutputStream(cache)){out.write(text.getBytes(StandardCharsets.UTF_8));}
        catch(Exception e){call.reject("Geçici yedek hazırlanamadı.");return;}
        // Capacitor persists call options in the activity Bundle. Large save text must stay on disk.
        call.getData().remove("text");
        call.getData().put("backupCache",cache.getName());
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE,call.getString("name","TEM-kariyer.json"));
        try{startActivityForResult(call,intent,"writeBackup");}catch(Exception e){cache.delete();call.reject("Dosya kaydetme ekranı açılamadı.");}
    }
    @ActivityCallback private void writeBackup(PluginCall call, ActivityResult result) {
        if(call==null)return;
        Uri uri=result.getData()==null?null:result.getData().getData();
        String name=call.getString("backupCache","");
        if(!name.matches("tem-backup-[a-f0-9-]+\\.json")){call.reject("Geçici yedek bulunamadı.");return;}
        File cache=new File(getContext().getCacheDir(),name);
        if(result.getResultCode()!=Activity.RESULT_OK || uri==null){cache.delete();cancel(call);return;}
        new Thread(()->{
            try(InputStream in=new FileInputStream(cache);OutputStream out=getContext().getContentResolver().openOutputStream(uri,"wt")){
                if(out==null)throw new IOException();
                byte[] buffer=new byte[8192];int n;
                while((n=in.read(buffer))!=-1)out.write(buffer,0,n);
                JSObject r=new JSObject();r.put("cancelled",false);call.resolve(r);
            }catch(Exception e){call.reject("Yedek dosyası yazılamadı.");}finally{cache.delete();}
        }).start();
    }
    @PluginMethod public void importSave(PluginCall call){
        Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        try{startActivityForResult(call,intent,"readBackup");}catch(Exception e){call.reject("Dosya seçme ekranı açılamadı.");}
    }
    @ActivityCallback private void readBackup(PluginCall call,ActivityResult result){
        if(call==null)return;
        Uri uri=result.getData()==null?null:result.getData().getData();
        if(result.getResultCode()!=Activity.RESULT_OK || uri==null){cancel(call);return;}
        new Thread(()->{
            try(InputStream in=getContext().getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){
                if(in==null)throw new IOException();
                byte[] buffer=new byte[8192];int n;
                while((n=in.read(buffer))!=-1){if(out.size()+n>MAX_BYTES)throw new IOException();out.write(buffer,0,n);}
                JSObject r=new JSObject();r.put("cancelled",false);r.put("text",out.toString(StandardCharsets.UTF_8.name()));call.resolve(r);
            }catch(Exception e){call.reject("Dosya okunamadı veya 8 MB sınırını aşıyor.");}
        }).start();
    }
    private void cancel(PluginCall call){JSObject r=new JSObject();r.put("cancelled",true);call.resolve(r);}
}
