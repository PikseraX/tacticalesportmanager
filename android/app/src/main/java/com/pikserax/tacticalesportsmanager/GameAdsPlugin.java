package com.pikserax.tacticalesportsmanager;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.FrameLayout;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.interstitial.*;
import com.google.android.gms.ads.rewarded.*;
import com.google.android.ump.*;

@CapacitorPlugin(name = "GameAds")
public class GameAdsPlugin extends Plugin {
    private ConsentInformation consent;
    private AdView banner;
    private FrameLayout slot;
    private InterstitialAd interstitial;
    private RewardedAd rewarded;
    private boolean rewardedLoading;
    private long loadedAt, nextLoadAt;
    private boolean initialized, loading, showing;
    private PluginCall pending;
    private boolean adsDisabled;

    @PluginMethod public void setAdsDisabled(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            boolean disabled = call.getBoolean("disabled", false);
            if (adsDisabled != disabled) {
                adsDisabled = disabled;
                if (disabled) {
                    interstitial = null;
                    if (banner != null) { banner.destroy(); banner = null; }
                    if (slot != null) { slot.removeAllViews(); slot.setVisibility(View.GONE); }
                } else if (initialized && consent != null && consent.canRequestAds()) {
                    createBanner();
                    loadInterstitial();
                } else {
                    startAds();
                }
            }
            call.resolve();
        });
    }
    private JSObject status() {
        JSObject r = new JSObject();
        r.put("privacyRequired", consent != null && consent.getPrivacyOptionsRequirementStatus()
            == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED);
        r.put("testMode", BuildConfig.DEBUG); return r;
    }
    @PluginMethod public void initialize(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            consent = UserMessagingPlatform.getConsentInformation(getContext());
            consent.requestConsentInfoUpdate(getActivity(), new ConsentRequestParameters.Builder().build(),
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(getActivity(), error -> {
                    startAds(); call.resolve(status());
                }), error -> { startAds(); call.resolve(status()); });
            // Önceki oturumun geçerli onayı varsa banner için ağ yanıtını bekleme.
            startAds();
        });
    }
    private void startAds() {
        if (consent == null || !consent.canRequestAds() || initialized) return;
        initialized = true;
        MobileAds.initialize(getContext(), result -> getActivity().runOnUiThread(() -> {
            if (getActivity().isFinishing()) return;
            loadRewarded();
            if (!adsDisabled) { createBanner(); loadInterstitial(); }
        }));
    }
    private void createBanner() {
        if (adsDisabled || banner != null) return;
        if (slot == null) {
            ViewGroup content = getActivity().findViewById(android.R.id.content);
            View game = content.getChildAt(0); content.removeView(game);
            LinearLayout column = new LinearLayout(getContext());
            column.setOrientation(LinearLayout.VERTICAL);
            column.addView(game, new LinearLayout.LayoutParams(-1, 0, 1));
            slot = new FrameLayout(getContext()); slot.setVisibility(View.GONE);
            column.addView(slot, new LinearLayout.LayoutParams(-1, -2));
            content.addView(column, new ViewGroup.LayoutParams(-1, -1));
            ViewCompat.setOnApplyWindowInsetsListener(slot, (view, insets) -> {
                androidx.core.graphics.Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                view.setPadding(bars.left, 8, bars.right, bars.bottom); return insets;
            });
        }
        slot.removeAllViews();
        slot.post(() -> {
            if (adsDisabled || banner != null || getActivity().isFinishing()) return;
            banner = new AdView(getContext());
            banner.setAdUnitId(BuildConfig.DEBUG ? "ca-app-pub-3940256099942544/6300978111"
                : "ca-app-pub-5635814061302700/8436367443");
            int width = Math.max(1, (int)(getActivity().findViewById(android.R.id.content).getWidth()
                / getContext().getResources().getDisplayMetrics().density));
            banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(getContext(), width));
            AdView currentBanner = banner;
            banner.setAdListener(new AdListener() {
                @Override public void onAdLoaded() {
                    if (adsDisabled || banner != currentBanner) return;
                    slot.setVisibility(View.VISIBLE); ViewCompat.requestApplyInsets(slot);
                }
                @Override public void onAdFailedToLoad(LoadAdError error) { slot.setVisibility(View.GONE); }
            });
            slot.addView(banner, new FrameLayout.LayoutParams(-1, -2));
            banner.loadAd(new AdRequest.Builder().build());
        });
    }
    private void loadInterstitial() {
        if (adsDisabled || loading || showing || consent == null || !consent.canRequestAds()
                || System.currentTimeMillis() < nextLoadAt) return;
        loading = true;
        InterstitialAd.load(getContext(), BuildConfig.DEBUG ? "ca-app-pub-3940256099942544/1033173712"
            : "ca-app-pub-5635814061302700/9637768475", new AdRequest.Builder().build(),
            new InterstitialAdLoadCallback() {
                @Override public void onAdLoaded(InterstitialAd ad) {
                    loading = false; nextLoadAt = 0; interstitial = adsDisabled ? null : ad; loadedAt = System.currentTimeMillis();
                }
                @Override public void onAdFailedToLoad(LoadAdError error) {
                    loading = false; interstitial = null; nextLoadAt = System.currentTimeMillis() + 15000;
                }
            });
    }
    @PluginMethod public void isInterstitialReady(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            boolean available = !adsDisabled && !showing && consent != null && consent.canRequestAds()
                && interstitial != null && System.currentTimeMillis() - loadedAt <= 55 * 60000L;
            if (!available && !showing) { interstitial = null; loadInterstitial(); }
            JSObject result = new JSObject(); result.put("ready", available); call.resolve(result);
        });
    }
    @PluginMethod public void showInterstitial(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (adsDisabled || showing || consent == null || !consent.canRequestAds() || interstitial == null
                    || System.currentTimeMillis() - loadedAt > 55 * 60000L || getActivity().isFinishing()) {
                JSObject r = new JSObject(); r.put("shown", false); call.resolve(r);
                if (!showing) { interstitial = null; loadInterstitial(); } return;
            }
            InterstitialAd ad = interstitial; interstitial = null; showing = true; pending = call;
            ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                private long shownAt;
                @Override public void onAdShowedFullScreenContent() { shownAt = System.currentTimeMillis(); }
                @Override public void onAdDismissedFullScreenContent() { finish(shownAt != 0, shownAt); }
                @Override public void onAdFailedToShowFullScreenContent(AdError error) { finish(false, 0); }
            });
            ad.show(getActivity());
        });
    }
    private void finish(boolean shown, long shownAt) {
        showing = false;
        if (pending != null) {
            JSObject r = new JSObject(); r.put("shown", shown); r.put("shownAt", shownAt);
            pending.resolve(r); pending = null;
        }
        loadInterstitial();
    }
    private void loadRewarded() {
        if (rewardedLoading || rewarded != null || consent == null || !consent.canRequestAds()) return;
        rewardedLoading = true;
        RewardedAd.load(getContext(), BuildConfig.DEBUG ? "ca-app-pub-3940256099942544/5224354917"
            : "ca-app-pub-5635814061302700/1930405519", new AdRequest.Builder().build(),
            new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(RewardedAd ad) { rewardedLoading = false; rewarded = ad; }
                @Override public void onAdFailedToLoad(LoadAdError error) { rewardedLoading = false; rewarded = null; }
            });
    }
    @PluginMethod public void showRewarded(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (showing || consent == null || !consent.canRequestAds() || rewarded == null || getActivity().isFinishing()) {
                loadRewarded();
                JSObject r = new JSObject(); r.put("earned", false); call.resolve(r); return;
            }
            RewardedAd ad = rewarded; rewarded = null; showing = true;
            final boolean[] earned = { false };
            ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() {
                    showing = false;
                    JSObject r = new JSObject(); r.put("earned", earned[0]); call.resolve(r);
                    loadRewarded();
                }
                @Override public void onAdFailedToShowFullScreenContent(AdError error) {
                    showing = false;
                    JSObject r = new JSObject(); r.put("earned", false); call.resolve(r);
                    loadRewarded();
                }
            });
            ad.show(getActivity(), rewardItem -> earned[0] = true);
        });
    }
    @PluginMethod public void privacyOptions(PluginCall call) {
        getActivity().runOnUiThread(() -> UserMessagingPlatform.showPrivacyOptionsForm(getActivity(), error -> {
            if (banner != null) { banner.destroy(); banner = null; }
            if (slot != null) { slot.setVisibility(View.GONE); }
            interstitial = null; rewarded = null; initialized = false;
            startAds(); call.resolve(status());
        }));
    }
    @Override protected void handleOnPause() { if (banner != null) banner.pause(); }
    @Override protected void handleOnResume() { if (banner != null) banner.resume(); }
    @Override protected void handleOnDestroy() {
        if (banner != null) banner.destroy();
        if (pending != null) { JSObject r = new JSObject(); r.put("shown", false); pending.resolve(r); pending = null; }
        interstitial = null;
        rewarded = null;
    }
}
