package com.pikserax.tacticalesportsmanager;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.net.Uri;
import androidx.appcompat.app.AlertDialog;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Feedback")
public class FeedbackPlugin extends Plugin {
    @PluginMethod public void open(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            String email = "tacticalesportsmanager@gmail.com";
            String subject = call.getString("subject", "Tactical Esports Manager — Geri bildirim");
            String body = call.getString("body", "");
            Uri mail = Uri.parse("mailto:" + email + "?subject=" + Uri.encode(subject) + "&body=" + Uri.encode(body));
            JSObject result = new JSObject();
            try {
                Intent intent = new Intent(Intent.ACTION_SENDTO, mail);
                intent.putExtra(Intent.EXTRA_EMAIL, new String[]{email});
                intent.putExtra(Intent.EXTRA_SUBJECT, subject);
                intent.putExtra(Intent.EXTRA_TEXT, body);
                getActivity().startActivity(intent);
                result.put("opened", true);
            } catch (ActivityNotFoundException error) {
                new AlertDialog.Builder(getActivity()).setTitle("Geri bildirim")
                    .setMessage("E-posta uygulaması bulunamadı. Bize bu adresten ulaşabilirsin:\n\n" + email)
                    .setPositiveButton("Mesajı ve adresi kopyala", (dialog, which) -> {
                        ClipboardManager clipboard = (ClipboardManager)getContext().getSystemService(Context.CLIPBOARD_SERVICE);
                        if (clipboard != null) clipboard.setPrimaryClip(ClipData.newPlainText("Geri bildirim", email + "\n" + subject + "\n\n" + body));
                    }).setNegativeButton("Kapat", null).show();
                result.put("opened", false);
            }
            call.resolve(result);
        });
    }
}
