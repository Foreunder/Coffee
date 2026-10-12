// Talks to the Foreunder guest backend (a Google Apps Script web app in Jamey's Google account).
// Set guestApi in data.js to the web app URL; while it is empty, guest features stay hidden.
window.GUEST = (function(){
  var M = window.FOREUNDER || {};
  var API = M.guestApi || "";
  function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e) { return null; } }
  function device(){
    var d = store("foreunder.device");
    if (!d){ d = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); store("foreunder.device", d); }
    return d;
  }
  function post(obj){
    obj.device = device();
    obj.name = obj.name != null ? obj.name : (store("foreunder.name") || "");
    // text/plain keeps this a simple request, so no CORS preflight is needed.
    return fetch(API, { method: "POST", body: JSON.stringify(obj) }).then(function(r){ return r.json(); });
  }
  function ratings(){
    return fetch(API + (API.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now()).then(function(r){ return r.json(); })
      .then(function(j){ return (j && j.ratings) || {}; });
  }
  return {
    on: !!API,
    device: device,
    name: function(v){ return v === undefined ? (store("foreunder.name") || "") : store("foreunder.name", v); },
    rate: function(coffee, rating){ return post({ type: "rating", coffee: coffee, rating: rating || 0 }); },
    photo: function(drink, base64){ return post({ type: "photo", drink: drink, data: base64 }); },
    ratings: ratings
  };
})();
