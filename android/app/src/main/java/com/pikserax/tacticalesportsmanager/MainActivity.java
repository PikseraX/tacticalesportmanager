package com.pikserax.tacticalesportsmanager;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        registerPlugin(GameAdsPlugin.class);
        registerPlugin(FeedbackPlugin.class);
        registerPlugin(CareerBackupPlugin.class);
        super.onCreate(state);
    }
}
