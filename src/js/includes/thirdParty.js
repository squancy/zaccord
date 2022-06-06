window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'UA-172408841-1');
gtag('config', 'UA-169198596-1');
gtag('config', 'AW-577856704');

if (window.location.href.match(/https:\/\/www\.zaccord\.com\/buy\?product=(.+)/)) {
  gtag('event', 'conversion', {'send_to': 'AW-577856704/zAdjCJz39aUDEMDJxZMC'});
}

if (window.location.href.match(/https:\/\/www\.zaccord\.com\/uploadPrint\?(.+)/)) {
  gtag('event', 'conversion', {'send_to': 'AW-577856704/yM1KCIXewaUDEMDJxZMC'});
}

(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:2015112,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

function recordConversion(url, amount, sid) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  
  gtag('event', 'conversion', {
      'send_to': 'AW-577856704/' + sid,
      'value': amount,
      'currency': 'HUF',
      'event_callback': callback
  });

  return false;
}

window.addEventListener('load', (e) => {
  // Record uploaded STL & image files as a product in the cart
  if (_('priceHolder') && typeof(recordConversion) != 'undefined' && recordConversion) {
    recordConversion(undefined, Number(_('priceHolder').innerHTML), 'g100CPHx9KUDEMDJxZMC');
    console.log('Conversion');
  }
});

/*
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
 fbq('init', '405507547313452'); 
fbq('track', 'PageView');
*/
