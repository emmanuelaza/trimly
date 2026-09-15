'use client'

import Script from 'next/script'

export function OneSignalScript() {
  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="lazyOnload"
      />
      <Script id="onesignal-init" strategy="lazyOnload">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "b2d99d08-461f-42cd-ab77-46cd1ce60963",
              notifyButton: { enable: false },
              promptOptions: {
                slidedown: {
                  prompts: [{
                    type: "push",
                    autoPrompt: false,
                  }]
                }
              }
            });
          });
        `}
      </Script>
    </>
  )
}
