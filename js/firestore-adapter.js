// Firestore Adapter
(function() {
  window.initFirebase = function() {
    try {
      if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length && window.FIREBASE_CONFIG) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
    } catch(e) {}
  };

  window.db = function() {
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        return firebase.firestore();
      }
    } catch(e) {}
    return null;
  };
})();
