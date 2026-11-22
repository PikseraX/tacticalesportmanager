package com.pikserax.tacticalesportsmanager;
import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        registerPlugin(GameAdsPlugin.class);
        registerPlugin(FeedbackPlugin.class);
        registerPlugin(CareerBackupPlugin.class);
        super.onCreate(state);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(
                        "(function(){return typeof window.temGeriTusuIsle==='function'&&window.temGeriTusuIsle()?'handled':'exit';})()",
                        result -> {
                            if (result == null || !result.contains("handled")) {
                                if (getBridge() != null && getBridge().getWebView() != null && getBridge().getWebView().canGoBack()) {
                                    getBridge().getWebView().goBack();
                                } else {
                                    finish();
                                }
                            }
                        }
                    );
                } else {
                    finish();
                }
            }
        });
    }
}
