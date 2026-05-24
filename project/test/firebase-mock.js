// In-memory Firebase compat SDK mock for integration testing.
// Exposes window.__test__ for seeding data and simulating auth.
(function () {
  const _store = {};       // docPath → plain object
  const _docListeners = {}; // docPath → [cb, ...]
  const _colListeners = {}; // collPath → [cb, ...]
  const _authListeners = [];
  let _currentUser = null;

  // ---- helpers ----

  function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

  function makeDocSnap(path) {
    const data = _store[path];
    return {
      exists: !!data,
      id: path.split('/').pop(),
      ref: { id: path.split('/').pop(), path },
      data: () => (data ? deepClone(data) : undefined),
    };
  }

  function makeQuerySnap(docs) {
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
      forEach: (cb) => docs.forEach(cb),
    };
  }

  function notifyDoc(path) {
    ((_docListeners[path] || []).slice()).forEach(cb => cb(makeDocSnap(path)));
    // Also notify parent collection listeners
    const collPath = path.split('/').slice(0, -1).join('/');
    notifyCol(collPath);
  }

  function notifyCol(collPath) {
    ((_colListeners[collPath] || []).slice()).forEach(fn => fn());
  }

  // ---- CollRef ----

  function CollRef(path, conditions, order, lim) {
    this._path = path;
    this._conds = conditions || [];
    this._order = order || null;
    this._lim = lim || null;

    this.doc = (id) => {
      const docId = id || ('auto_' + Date.now() + '_' + Math.random().toString(36).slice(2));
      return new DocRef(path + '/' + docId);
    };

    this.add = (data) => {
      const id = 'auto_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const docPath = path + '/' + id;
      _store[docPath] = deepClone(data);
      notifyDoc(docPath);
      return Promise.resolve(new DocRef(docPath));
    };

    this.where = (field, op, value) =>
      new CollRef(path, [...this._conds, { field, op, value }], this._order, this._lim);

    this.orderBy = (field, dir) =>
      new CollRef(path, this._conds, { field, dir: dir || 'asc' }, this._lim);

    this.limit = (n) =>
      new CollRef(path, this._conds, this._order, n);

    const buildDocs = () => {
      const prefix = path + '/';
      let docs = Object.entries(_store)
        .filter(([k]) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
        .map(([k, v]) => ({
          id: k.split('/').pop(), path: k, exists: true,
          data: () => deepClone(v),
          ref: { id: k.split('/').pop(), path: k },
        }));

      this._conds.forEach(({ field, op, value }) => {
        docs = docs.filter(doc => {
          const d = doc.data();
          const v = field.split('.').reduce((o, k) => o?.[k], d);
          if (op === '==') return v === value;
          if (op === '!=') return v !== value;
          if (op === '>') return v > value;
          if (op === '<') return v < value;
          if (op === '>=') return v >= value;
          if (op === '<=') return v <= value;
          if (op === 'array-contains') return Array.isArray(v) && v.includes(value);
          return true;
        });
      });

      if (this._order) {
        const { field, dir } = this._order;
        docs.sort((a, b) => {
          const va = field.split('.').reduce((o, k) => o?.[k], a.data());
          const vb = field.split('.').reduce((o, k) => o?.[k], b.data());
          const cmp = va < vb ? -1 : va > vb ? 1 : 0;
          return dir === 'desc' ? -cmp : cmp;
        });
      }

      if (this._lim) docs = docs.slice(0, this._lim);
      return docs;
    };

    this.get = () => Promise.resolve(makeQuerySnap(buildDocs()));

    this.onSnapshot = (onNext, onError) => {
      if (!_colListeners[path]) _colListeners[path] = [];
      const handler = () => onNext(makeQuerySnap(buildDocs()));
      _colListeners[path].push(handler);
      handler(); // immediate fire
      return () => {
        _colListeners[path] = (_colListeners[path] || []).filter(l => l !== handler);
      };
    };
  }

  // ---- DocRef ----

  function DocRef(path) {
    this._path = path;

    this.get = () => Promise.resolve(makeDocSnap(path));

    this.set = (data, opts) => {
      _store[path] = opts && opts.merge
        ? Object.assign({}, _store[path] || {}, deepClone(data))
        : deepClone(data);
      notifyDoc(path);
      return Promise.resolve();
    };

    this.update = (data) => {
      _store[path] = Object.assign({}, _store[path] || {}, deepClone(data));
      notifyDoc(path);
      return Promise.resolve();
    };

    this.delete = () => {
      delete _store[path];
      notifyDoc(path);
      return Promise.resolve();
    };

    this.onSnapshot = (onNext, onError) => {
      if (!_docListeners[path]) _docListeners[path] = [];
      _docListeners[path].push(onNext);
      onNext(makeDocSnap(path)); // immediate fire
      return () => {
        _docListeners[path] = (_docListeners[path] || []).filter(l => l !== onNext);
      };
    };

    this.collection = (name) => new CollRef(path + '/' + name);
  }

  // ---- Firestore ----

  const firestoreInstance = {
    collection: (name) => new CollRef(name),
  };

  // ---- Auth ----

  const authInstance = {
    currentUser: null,

    onAuthStateChanged(cb) {
      _authListeners.push(cb);
      cb(_currentUser);
      return () => {
        const i = _authListeners.indexOf(cb);
        if (i >= 0) _authListeners.splice(i, 1);
      };
    },

    signInWithEmailAndPassword(email, password) {
      const user = { uid: 'test-uid-' + email.replace(/\W/g, ''), email, displayName: email.split('@')[0] };
      _currentUser = user;
      authInstance.currentUser = user;
      _authListeners.forEach(cb => cb(user));
      return Promise.resolve({ user });
    },

    createUserWithEmailAndPassword(email, password) {
      const user = { uid: 'test-uid-' + Date.now(), email, displayName: null };
      _currentUser = user;
      authInstance.currentUser = user;
      _authListeners.forEach(cb => cb(user));
      return Promise.resolve({ user });
    },

    signInWithPopup(provider) {
      return this.signInWithEmailAndPassword('google@test.com', 'google');
    },

    signOut() {
      _currentUser = null;
      authInstance.currentUser = null;
      _authListeners.forEach(cb => cb(null));
      return Promise.resolve();
    },

    sendPasswordResetEmail(email) { return Promise.resolve(); },
  };

  class GoogleAuthProvider {}

  // ---- firebase global ----

  window.firebase = {
    apps: [{}], // non-empty = already initialized
    initializeApp: () => {},
    firestore: () => firestoreInstance,
    auth: Object.assign(() => authInstance, { GoogleAuthProvider }),
  };

  // ---- Test utilities ----

  window.__test__ = {
    // Simulate auth with given uid/email/displayName
    login(uid, email, displayName) {
      const user = { uid, email: email || uid + '@test.com', displayName: displayName || uid };
      _currentUser = user;
      authInstance.currentUser = user;
      _authListeners.forEach(cb => cb(user));
    },

    logout() {
      _currentUser = null;
      authInstance.currentUser = null;
      _authListeners.forEach(cb => cb(null));
    },

    // Seed a document at an arbitrary path
    seedDoc(path, data) {
      _store[path] = JSON.parse(JSON.stringify(data));
    },

    // Remove all data from the store
    clearAll() {
      Object.keys(_store).forEach(k => delete _store[k]);
    },

    // Inspect store (for assertions)
    getDoc(path) {
      return _store[path] ? JSON.parse(JSON.stringify(_store[path])) : undefined;
    },

    getStore() {
      return JSON.parse(JSON.stringify(_store));
    },
  };

  console.log('[firebase-mock] ready — window.__test__ available');
})();
